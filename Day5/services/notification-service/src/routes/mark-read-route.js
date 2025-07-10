const express = require("express");

const markNotificationRead = require("../controllers/mark-notification-read");
const { currentUser } = require("../middlewares/current-user");

const router = express.Router();

router.put("/api/notifications/read/:id", currentUser, markNotificationRead);

module.exports = { markReadRouter: router };
