const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { BadRequestError } = require("../errors/bad-request-error");
const { Notification } = require("../models/notification");

const getAllNotifications = async (req, res) => {
  console.log("\n[New log]:");

  const { role, id: currentUserId } = req.currentUser;

  console.log("Fetching notifications from database.");

  try {
    let filter = {};

    if (role === "customer") {
      filter.userid = currentUserId;
    } else if (role === "manager") {
      filter.role = "manager";
    } else {
      throw new BadRequestError("Invalid user role!");
    }

    const notifications = await Notification.find(filter).sort({
      createdAt: -1,
    });

    console.log(`Found ${notifications.length} notifications in database.`);

    res.status(200).send({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    console.log("Error fetching notifications:", error.message);
    throw new DatabaseConnectionError();
  }
};

module.exports = getAllNotifications;
