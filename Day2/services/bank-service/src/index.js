const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const { getBankRouter } = require("./routes/get-bank-route");
const { addBankRouter } = require("./routes/add-bank-route");

const { errorHandler } = require("./middlewares/error-handler");
const { NotFoundError } = require("./errors/not-found-error");
const {
  DatabaseConnectionError,
} = require("./errors/database-connection-error");

const app = express();

app.enable("trust proxy");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(addBankRouter);
app.use(getBankRouter);

app.use(async (req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

const start = async () => {
  const PORT = 8002;

  try {
    await mongoose.connect("mongodb://localhost:27017/PLMS-Bank");
    console.log("Connected to MongoDB :]");
  } catch (err) {
    throw new DatabaseConnectionError();
  }

  app.listen(PORT, () => {
    console.log("Listening on port 8002");
  });
};

start();
