const express = require("express");
const cors = require("cors");

require("dotenv").config();

const { getBankRouter } = require("./routes/get-bank-route");

const { NotFoundError } = require("./errors/not-found-error");
const { errorHandler } = require("./middlewares/error-handler");
const { addBankRouter } = require("./routes/add-bank-route");

global.banks = [];

const app = express();
const PORT = 8002;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(getBankRouter);
app.use(addBankRouter);

app.use(async (req, res, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Listening on port 8002");
});
