const express = require("express");

require("dotenv").config();

const { getBankRouter } = require("./routes/get-bank-route");

const { NotFoundError } = require("./errors/not-found-error");
const { errorHandler } = require("./middlewares/error-handler");
const { addBankRouter } = require("./routes/add-bank-route");

global.banks = [];

const app = express();
const PORT = 8002;

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
