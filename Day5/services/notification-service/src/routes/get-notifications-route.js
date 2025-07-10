const express = require("express");

const getAllNotifications = require("../controllers/get-all-notifications");
const { currentUser } = require("../middlewares/current-user");

const router = express.Router();

router.get("/api/notifications/all", currentUser, getAllNotifications);

module.exports = { getNotificationsRouter: router };
