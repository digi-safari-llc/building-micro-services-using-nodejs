const { Loan } = require("../models/loans");
const logger = require("../utils/logger");

const saveLoans = async (msg, channel) => {
  const eventId = Date.now().toString();

  try {
    logger.info(`[${eventId}] Processing save loans event`, {
      queue: "loan_save",
      eventId,
    });

    const eventLoan = JSON.parse(msg.content.toString());

    logger.debug(`[${eventId}] Parsed loan save event data`, {
      loanId: eventLoan.loan?.id,
      eventId,
    });

    const { loan } = eventLoan;

    logger.debug(`[${eventId}] Checking for existing loan`, {
      loanId: loan.id,
      eventId,
    });

    const existingLoan = await Loan.findById(loan.id);

    if (existingLoan) {
      logger.warn(`[${eventId}] Loan data already exists`, {
        loanId: loan.id,
        eventId,
      });
      channel.ack(msg);
      return;
    }

    logger.debug(`[${eventId}] Creating new loan record`, {
      loanId: loan.id,
      userId: loan.userid,
      bankId: loan.bankId,
      eventId,
    });

    const newLoan = new Loan({
      _id: loan.id,
      ...loan,
    });

    await newLoan.save();

    logger.info(`[${eventId}] New loan data saved successfully`, {
      loanId: loan.id,
      userId: loan.userid,
      bankId: loan.bankId,
      bankName: loan.bankName,
      appliedLoanAmount: loan.appliedLoanAmount,
      eventId,
    });

    channel.ack(msg);
  } catch (err) {
    logger.error(`[${eventId}] Error in save loans process`, {
      error: err.message,
      stack: err.stack,
      messageContent: msg.content.toString(),
      eventId,
    });

    channel.nack(msg, false, true);
  }
};

module.exports = { saveLoans };
