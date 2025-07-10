const express = require("express");

const addbank = require("../controllers/add-bank-controller");

const router = express.Router();

router.post("/api/banks/addbank", addbank);

module.exports = { addBankRouter: router };
