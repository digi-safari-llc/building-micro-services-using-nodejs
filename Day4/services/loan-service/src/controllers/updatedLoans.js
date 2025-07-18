const { Loan } = require("../models/loans");
const logger = require("../utils/logger");

const updateLoans = async (msg, channel) => {
  const eventId = Date.now().toString();

  try {
    logger.info(`[${eventId}] Processing loan update event`, {
      queue: "loan_updated",
      eventId,
    });

    const eventData = JSON.parse(msg.content.toString());

    logger.debug(`[${eventId}] Parsed loan update event data`, {
      reviewId: eventData.review?.id,
      newStatus: eventData.review?.status,
      eventId,
    });

    const { review } = eventData;

    logger.debug(`[${eventId}] Searching for loan to update`, {
      loanId: review.id,
      eventId,
    });

    const existingLoan = await Loan.findById(review.id);

    if (!existingLoan) {
      logger.warn(`[${eventId}] Loan not found for update`, {
        loanId: review.id,
        eventId,
      });
      channel.ack(msg);
      return;
    }

    logger.info(`[${eventId}] Updating loan status`, {
      loanId: review.id,
      userId: existingLoan.userid,
      bankId: existingLoan.bankId,
      fromStatus: existingLoan.status,
      toStatus: review.status,
      eventId,
    });

    existingLoan.status = review.status;
    await existingLoan.save();

    logger.info(`[${eventId}] Loan status updated successfully`, {
      loanId: review.id,
      userId: existingLoan.userid,
      bankId: existingLoan.bankId,
      newStatus: review.status,
      eventId,
    });

    channel.ack(msg);
  } catch (err) {
    logger.error(`[${eventId}] Error updating loan status`, {
      error: err.message,
      stack: err.stack,
      messageContent: msg.content.toString(),
      eventId,
    });

    channel.nack(msg, false, true);
  }
};

module.exports = { updateLoans };
