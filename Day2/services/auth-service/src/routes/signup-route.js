const express = require("express");

const signup = require("../controllers/signup");
const { validateRequest } = require("../middlewares/validate-request");
const { signupSchema } = require("../schemas/validation-schemas");

const router = express.Router();

router.post("/api/users/signup", validateRequest(signupSchema), signup);

module.exports = { signupRouter: router };
