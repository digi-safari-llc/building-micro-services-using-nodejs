const { Notification } = require("../models/notification");
const logger = require("../utils/logger");

const loanCreated = async (msg, channel) => {
  const eventId = Date.now().toString();

  try {
    logger.info(`[${eventId}] Processing loan created event`, {
      queue: "loan_created",
      eventId,
    });

    const eventData = JSON.parse(msg.content.toString());

    const { loan } = eventData;

    logger.debug(`[${eventId}] Parsed loan created event data`, {
      loanId: loan.id,
      eventData,
      eventId,
    });

    logger.debug(`[${eventId}] Checking for existing notification`, {
      loanId: loan.id,
      type: "loan_created",
      role: "manager",
      eventId,
    });

    const existingNotification = await Notification.findOne({
      loanId: loan.id,
      type: "loan_created",
      role: "manager",
    });

    if (existingNotification) {
      logger.warn(`[${eventId}] Duplicate notification detected`, {
        loanId: loan.id,
        existingNotificationId: existingNotification.id,
        eventId,
      });
      channel.ack(msg);
      return;
    }

    const notificationData = {
      loanId: loan.id,
      role: "manager",
      type: "loan_created",
      title: "New Loan Application",
      message: "A new loan has been added to review list of loans.",
    };

    logger.debug(`[${eventId}] Creating new loan notification`, {
      notificationData,
      eventId,
    });

    const newNotification = new Notification(notificationData);

    await newNotification.save();

    logger.info(`[${eventId}] Loan created notification saved successfully`, {
      loanId: loan.id,
      notificationId: newNotification.id,
      eventId,
    });

    channel.ack(msg);
  } catch (err) {
    logger.error(`[${eventId}] Error processing loan created event`, {
      error: err.message,
      stack: err.stack,
      messageContent: msg.content.toString(),
      eventId,
    });

    channel.nack(msg, false, true);
  }
};

module.exports = loanCreated;
