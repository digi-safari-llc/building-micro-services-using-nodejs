const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const { NotFoundError } = require("./errors/not-found-error");
const { errorHandler } = require("./middlewares/error-handler");
const { createloanRouter } = require("./routes/createloan-route");
const { getloansRouter } = require("./routes/getloans-route");

const app = express();

app.use(express.json());

app.use(createloanRouter);
app.use(getloansRouter);

app.use(async (req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

const start = async () => {
  const PORT = 8003;

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://localhost:27017/PLMS-Loans");
    console.log("Connected to MongoDB :]");
  } catch (err) {
    console.log(err);
  }

  app.listen(PORT, () => {
    console.log("Listening on port 8003");
  });
};

start();
