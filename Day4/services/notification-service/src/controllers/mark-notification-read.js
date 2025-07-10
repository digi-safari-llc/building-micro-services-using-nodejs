const { BadRequestError } = require("../errors/bad-request-error");
const { NotFoundError } = require("../errors/not-found-error");
const { Notification } = require("../models/notification");

const markNotificationRead = async (req, res) => {
  console.log("\n[New log]:");

  const { isRead } = req.query;
  const notificationId = req.params.id;
  const { role, id: currentUserId } = req.currentUser;

  console.log(currentUserId);

  console.log(
    `Marking notification ${notificationId} as read for user ${currentUserId} by ${currentUserId}`
  );

  if (!currentUserId) {
    throw new BadRequestError("Authentication required");
  }

  if (role !== "customer" && role !== "manager") {
    throw new BadRequestError(
      "Only customers and managers can mark notifications as read"
    );
  }

  console.log("Initial Validation Completed.");

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    console.log("Notification not found!");
    throw new NotFoundError("Notification not found!");
  }

  console.log("Notification found!");

  if (notification.role === "manager" && role === "manager") {
  } else if (notification.userid === currentUserId) {
  } else {
    throw new BadRequestError(
      "You can only mark your own notifications as read"
    );
  }

  if (notification.isRead) {
    console.log("Notification is already marked as read!");
    return res.status(200).send({
      success: [{ message: "Notification is already marked as read!" }],
      notification,
    });
  }

  console.log(`Marking notification as read...`);

  notification.isRead = true;
  await notification.save();

  console.log("Notification marked as read successfully.");

  res.status(200).send({
    success: [{ message: "Notification marked as read successfully!" }],
    notification,
  });
};

module.exports = markNotificationRead;
