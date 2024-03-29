const express = require("express");
const app = express();
// import mongoose
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const fs = require("fs");
const cors = require("cors");
// load env variables
const dotenv = require("dotenv");
dotenv.config();

//db connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connected"));

mongoose.connection.on("error", (err) => {
  console.log(`DB connection error: ${err.message}`);
});

//import routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

//documentation
app.get("/api", (req, res) => {
  fs.readFile("docs/apiDocs.json", (err, data) => {
    if (err) {
      res.status(400).json({
        error: err,
      });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});

//using middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized!" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`A Node JS API is listening on port: ${port}`);
});
