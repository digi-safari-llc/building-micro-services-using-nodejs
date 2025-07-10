const express = require("express");

const signout = require("../controllers/signout");
const router = express.Router();

router.post("/api/users/signout", signout);

module.exports = { signoutRouter: router };
