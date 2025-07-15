const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const { errorHandler } = require("./middlewares/error-handler");
const { NotFoundError } = require("./errors/not-found-error");
const { signinRouter } = require("./routes/signin-route");
const { signupRouter } = require("./routes/signup-route");
const { signoutRouter } = require("./routes/signout-route");

const app = express();

app.use(express.json());

app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.use(async (req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

const start = async () => {
  const PORT = 8001;

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://localhost:27017/PLMS-Auth");
    console.log("Connected to MongoDB :]");
  } catch (err) {
    console.log(err);
  }

  app.listen(PORT, () => {
    console.log("Listening on port 8001");
  });
};

start();
