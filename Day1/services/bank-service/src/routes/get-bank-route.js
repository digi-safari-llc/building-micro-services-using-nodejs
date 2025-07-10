const express = require("express");

const getbank = require("../controllers/get-bank-controller");

const router = express.Router();

router.get("/api/banks/getbank", getbank);

module.exports = { getBankRouter: router };
