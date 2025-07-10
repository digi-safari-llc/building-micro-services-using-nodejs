const express = require("express");

const createloan = require("../controllers/createloan");
const { validateRequest } = require("../middlewares/validate-request");
const { currentUser } = require("../middlewares/current-user");
const { createloanSchema } = require("../schemas/validation-schemas");

const router = express.Router();

router.post(
  "/api/loans/create",
  validateRequest(createloanSchema),
  currentUser,
  createloan
);

module.exports = { createloanRouter: router };
