const express = require("express");

const reviewLoan = require("../controllers/review-loan");
const { validateRequest } = require("../middlewares/validate-request");
const { currentUser } = require("../middlewares/current-user");
const { updateLoanSchema } = require("../schemas/validation-schemas");

const router = express.Router();

router.put(
  "/api/review/update/:id",
  currentUser,
  validateRequest(updateLoanSchema),
  reviewLoan
);

module.exports = { reviewLoanRouter: router };
