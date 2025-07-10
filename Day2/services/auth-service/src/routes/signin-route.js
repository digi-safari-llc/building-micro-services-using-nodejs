const express = require("express");

const signin = require("../controllers/signin");
const { validateRequest } = require("../middlewares/validate-request");
const { signinSchema } = require("../schemas/validation-schemas");

const router = express.Router();

router.post("/api/users/signin", validateRequest(signinSchema), signin);

module.exports = { signinRouter: router };
