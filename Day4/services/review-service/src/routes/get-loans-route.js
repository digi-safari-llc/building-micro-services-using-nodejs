const express = require("express");

const getAllLoans = require("../controllers/get-all-loans");
const { currentUser } = require("../middlewares/current-user");

const router = express.Router();

router.get("/api/review/all", currentUser, getAllLoans);

module.exports = { getloansRouter: router };
