const express = require("express");

exports.createPostValidator = (req, res, next) => {
  //title
  req.check("title", "Write a title").notEmpty();
  req.check("title", "Title must be 4-180 characters").isLength({
    min: 4,
    max: 180,
  });

  //body
  req.check("body", "Write a body").notEmpty();
  req.check("body", "Body must be 4-2000 characters").isLength({
    min: 4,
    max: 2000,
  });

  //error check
  const errors = req.validationErrors();

  //if occured then show the first error
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  //proceed to next middleware
  next();
};

exports.UserSignupValidator = (req, res, next) => {
  //name 4-10 characters
  req.check("name", "Name is required").notEmpty();
  //email checking
  req.check("email", "Email must be from 4-50 characters")
     .matches(/.+\@.+\..+/)
     .withMessage("Email must be in correct format")
     .isLength({
    min: 4,
    max: 2000
  })
  //password checking
  req.check("password", "Password is required").notEmpty();
  req.check("password")
    .isLength({min: 6})
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number");
  //errors checking
  const errors = req.validationErrors();

  //if occured then show the first error
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }

  //proceed to next middleware
  next();
};

exports.passwordResetValidator = (req, res, next) => {
  // check for password
  req.check("newPassword", "Password is required").notEmpty();
  req.check("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars long")
      .matches(/\d/)
      .withMessage("must contain a number")
      .withMessage("Password must contain a number");

  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
      const firstError = errors.map(error => error.msg)[0];
      return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware or ...
  next();
};
