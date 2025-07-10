const { Notification } = require("../models/notification");
const logger = require("../utils/logger");

const loanUpdated = async (msg, channel) => {
  const eventId = Date.now().toString();

  try {
    logger.info(`[${eventId}] Processing loan updated event`, {
      queue: "loan_updated",
      eventId,
    });

    const eventData = JSON.parse(msg.content.toString());
    const { review } = eventData;

    logger.debug(`[${eventId}] Parsed loan updated event data`, {
      loanId: review.id,
      userId: review.userid,
      status: review.status,
      eventData,
      eventId,
    });

    const notificationType =
      review.status === "approved" ? "loan_approved" : "loan_rejected";

    // Check for existing notification
    logger.debug(`[${eventId}] Checking for existing notification`, {
      loanId: review.id,
      type: notificationType,
      role: "customer",
      eventId,
    });

    const existingNotification = await Notification.findOne({
      loanId: review.id,
      type: notificationType,
      role: "customer",
    });

    if (existingNotification) {
      logger.warn(`[${eventId}] Duplicate notification detected`, {
        loanId: review.id,
        userId: review.userid,
        status: review.status,
        existingNotificationId: existingNotification.id,
        eventId,
      });
      channel.ack(msg);
      return;
    }

    const notificationData = {
      userid: review.userid,
      loanId: review.id,
      role: "customer",
      type: notificationType,
      title:
        review.status === "approved"
          ? "Loan Approved!"
          : "Loan Application Update",
      message:
        review.status === "approved"
          ? "Congratulations! Your loan application has been approved."
          : "Your loan application has been rejected. Please contact the bank for more details.",
    };

    logger.debug(`[${eventId}] Creating new loan update notification`, {
      notificationData,
      eventId,
    });

    const newNotification = new Notification(notificationData);
    await newNotification.save();

    logger.info(`[${eventId}] Loan updated notification saved successfully`, {
      loanId: review.id,
      userId: review.userid,
      status: review.status,
      notificationType,
      notificationId: newNotification.id,
      eventId,
    });

    channel.ack(msg);
  } catch (err) {
    logger.error(`[${eventId}] Error processing loan updated event`, {
      error: err.message,
      stack: err.stack,
      messageContent: msg.content.toString(),
      eventId,
    });

    channel.nack(msg, false, true);
  }
};

module.exports = loanUpdated;
