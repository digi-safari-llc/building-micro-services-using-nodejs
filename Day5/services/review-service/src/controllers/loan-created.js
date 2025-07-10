const { Review } = require("../models/review");
const logger = require("../utils/logger");

const loanCreated = async (msg, channel) => {
  const eventId = Date.now().toString();

  try {
    logger.info(`[${eventId}] Processing loan created event for review`, {
      queue: "loan_created",
      eventId,
    });

    const eventLoan = JSON.parse(msg.content.toString());

    logger.debug(`[${eventId}] Parsed loan created event data`, {
      loanId: eventLoan.loan?.id,
      eventId,
    });

    const { loan } = eventLoan;

    logger.debug(`[${eventId}] Checking for existing review`, {
      loanId: loan.id,
      eventId,
    });

    const existingReview = await Review.findById(loan.id);

    if (existingReview) {
      logger.warn(`[${eventId}] Review data already exists`, {
        loanId: loan.id,
        eventId,
      });
      channel.ack(msg);
      return;
    }

    logger.debug(`[${eventId}] Creating new review record`, {
      loanId: loan.id,
      userId: loan.userid,
      bankId: loan.bankId,
      eventId,
    });

    const newReview = new Review({
      _id: loan.id,
      ...loan,
    });

    await newReview.save();

    logger.info(`[${eventId}] New review data saved successfully`, {
      loanId: loan.id,
      userId: loan.userid,
      bankId: loan.bankId,
      bankName: loan.bankName,
      appliedLoanAmount: loan.appliedLoanAmount,
      status: loan.status,
      eventId,
    });

    channel.ack(msg);
  } catch (err) {
    logger.error(`[${eventId}] Error in loan created review process`, {
      error: err.message,
      stack: err.stack,
      messageContent: msg.content.toString(),
      eventId,
    });

    channel.nack(msg, false, true);
  }
};

module.exports = loanCreated;
