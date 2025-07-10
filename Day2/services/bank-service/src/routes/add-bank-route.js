const express = require("express");

const { validateRequest } = require("../middlewares/validate-request");
const { addbankSchema } = require("../schemas/validation-schemas");

const addbank = require("../controllers/add-bank-controller");

const router = express.Router();

router.post("/api/banks/addbank", validateRequest(addbankSchema), addbank);

module.exports = { addBankRouter: router };
