const { BadRequestError } = require("../errors/bad-request-error");
const { NotFoundError } = require("../errors/not-found-error");
const { Review } = require("../models/review");
const logger = require("../utils/logger");

const reviewLoan = async (req, res) => {
  const eventId = Date.now().toString();

  try {
    logger.info(`[${eventId}] Processing loan review request`, {
      eventId,
      endpoint: "reviewLoan",
    });

    const loanId = req.params.id;
    const { status } = req.body;
    const { role, id: currentUserId } = req.currentUser;

    logger.debug(`[${eventId}] Request parameters received`, {
      loanId,
      status,
      role,
      currentUserId,
      eventId,
    });

    if (!currentUserId) {
      logger.warn(
        `[${eventId}] Authentication required - no user ID provided`,
        {
          eventId,
        }
      );
      throw new BadRequestError("Authentication required");
    }

    if (role !== "manager") {
      logger.warn(
        `[${eventId}] Unauthorized access attempt - user is not a manager`,
        {
          role,
          currentUserId,
          eventId,
        }
      );
      throw new BadRequestError("Only managers can update loan status");
    }

    logger.debug(`[${eventId}] Initial validation completed`, {
      loanId,
      currentUserId,
      role,
      eventId,
    });

    const review = await Review.findById(loanId);

    if (!review) {
      logger.warn(`[${eventId}] Loan not found`, {
        loanId,
        eventId,
      });
      throw new NotFoundError("Loan application not found!");
    }

    logger.debug(`[${eventId}] Loan found successfully`, {
      loanId,
      currentStatus: review.status,
      eventId,
    });

    if (review.status !== "pending") {
      logger.warn(
        `[${eventId}] Loan status cannot be updated - already processed`,
        {
          loanId,
          currentStatus: review.status,
          attemptedStatus: status,
          eventId,
        }
      );
      throw new BadRequestError(
        "This loan application has already been processed!"
      );
    }

    logger.debug(`[${eventId}] Updating loan status`, {
      loanId,
      fromStatus: review.status,
      toStatus: status,
      updatedBy: currentUserId,
      eventId,
    });

    review.status = status;
    await review.save();

    logger.info(`[${eventId}] Loan status updated successfully`, {
      loanId,
      newStatus: status,
      updatedBy: currentUserId,
      eventId,
    });

    logger.debug(`[${eventId}] Preparing to send event to RabbitMQ`, {
      loanId,
      queue: "loan_updated",
      eventId,
    });

    const channel = req.rabbitChannel;
    const queueName = "loan_updated";
    const message = JSON.stringify({
      review,
    });

    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });

    logger.info(`[${eventId}] Event sent to RabbitMQ successfully`, {
      loanId,
      queue: queueName,
      status: review.status,
      eventId,
    });

    logger.info(`[${eventId}] Loan review process completed successfully`, {
      loanId,
      finalStatus: review.status,
      updatedBy: currentUserId,
      eventId,
    });

    res.status(200).send({
      success: [{ message: "Loan status updated successfully!" }],
      review,
    });
  } catch (err) {
    logger.error(`[${eventId}] Error in loan review process`, {
      error: err.message,
      stack: err.stack,
      loanId: req.params?.id,
      requestedStatus: req.body?.status,
      userId: req.currentUser?.id,
      eventId,
    });

    throw err;
  }
};

module.exports = reviewLoan;
