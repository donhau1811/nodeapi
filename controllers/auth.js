const _ = require("lodash");
const { sendEmail } = require("../helper");
// load env
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");

exports.signup = async (req, res) => {
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist)
    return res.status(403).json({
      error: "Email already existed",
    });
  const user = await new User(req.body);
  await user.save();
  res.status(200).json({ message: "Successful sign up! Log in now!" });
};

exports.signin = (req, res) => {
  // find the user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    // if err or no user
    if (err || !user) {
      return res.status(401).json({
        error: "User with that email does not exist. Please signup.",
      });
    }
    // if user is found make sure the email and password match
    // create authenticate method in model and use here
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    // generate a token with user id and secret
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET
    );
    // persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return response with user and token to frontend client
    const { _id, name, role, email } = user;
    return res.json({ token, user: { _id, name, role, email } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  return res.json({ message: "Successfully sign out" });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"], // added later
  //if the token's valid, express jwt appends the verified users id in an auth key to the request object
  userProperty: "auth",
});

// add forgotPassword and resetPassword methods
exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({ message: "No request body" });
  if (!req.body.email)
    return res.status(400).json({ message: "No Email in request body" });

  console.log("forgot password finding user with that email");
  const { email } = req.body;
  console.log("signin req.body", email);
  // find the user based on email
  User.findOne({ email }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "User with that email does not exist!",
      });

    // generate a token with user id and secret
    const token = jwt.sign(
      { _id: user._id, iss: "NODEAPI" },
      process.env.JWT_SECRET
    );

    // email data
    const emailData = {
      from: "noreply@node-react.com",
      to: email,
      subject: "Password Reset Instructions",
      text: `Please use the following link to reset your password: http://165.232.147.169/reset-password/${token}`,
      html: `<p>Please use the following link to reset your password:</p> <p>http://165.232.147.169/reset-password/${token}</p>`,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ message: err });
      } else {
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent to ${email}. Follow the instructions to reset your password.`,
        });
      }
    });
  });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  User.findOne({ resetPasswordLink }, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "Invalid Link!",
      });

    const updatedFields = {
      password: newPassword,
      resetPasswordLink: "",
    };

    user = _.extend(user, updatedFields);
    user.updated = Date.now();

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: `Great! Now you can login with your new password.`,
      });
    });
  });
};
