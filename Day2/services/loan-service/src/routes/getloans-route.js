const express = require("express");

const getloans = require("../controllers/getloans");
const { currentUser } = require("../middlewares/current-user");

const router = express.Router();

router.get("/api/loans/applications", currentUser, getloans);

module.exports = { getloansRouter: router };
