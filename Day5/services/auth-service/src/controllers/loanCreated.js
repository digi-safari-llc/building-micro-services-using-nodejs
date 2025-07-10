const { User } = require("../models/user");
const logger = require("../utils/logger");

const loanCreated = async (msg, channel) => {
  const eventId = Date.now().toString();

  try {
    logger.info(`[${eventId}] Processing loan created event`, {
      queue: "loan_created",
      eventId,
    });

    const eventData = JSON.parse(msg.content.toString());

    logger.debug(`[${eventId}] Parsed loan created event data`, {
      eventData,
      eventId,
    });

    const { userid, updatedUserData } = eventData.loan;

    logger.debug(`[${eventId}] Extracted user data from event`, {
      userid,
      updatedUserData,
      eventId,
    });

    logger.debug(`[${eventId}] Checking for existing user`, {
      userid,
      eventId,
    });

    const existingUser = await User.findOne({ userid });

    if (!existingUser) {
      logger.warn(`[${eventId}] User not found, creating new user`, {
        userid,
        eventId,
      });

      // Add user creation logic here
      logger.info(`[${eventId}] New user creation initiated`, {
        userid,
        eventId,
      });
    } else {
      logger.info(`[${eventId}] User found, processing loan event`, {
        userid,
        userEmail: existingUser.email,
        eventId,
      });
    }

    logger.info(`[${eventId}] Loan created event processed successfully`, {
      userid,
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
