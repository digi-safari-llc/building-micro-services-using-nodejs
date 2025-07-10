const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { BadRequestError } = require("../errors/bad-request-error");
const { Review } = require("../models/review");
const logger = require("../utils/logger");

const getAllLoans = async (req, res) => {
  const requestId = Date.now().toString();

  const { status, bankId } = req.query;
  const { role, id: currentUserId } = req.currentUser;

  logger.info(`[${requestId}] All loans retrieval request initiated`, {
    endpoint: "/api/reviews/loans",
    method: "GET",
    userId: currentUserId,
    userRole: role,
    queryParams: { status, bankId, userid: req.query.userid },
    requestId,
  });

  try {
    let filter = {};

    if (role === "customer") {
      logger.warn(
        `[${requestId}] Customer attempting to access manager-only service`,
        {
          userId: currentUserId,
          userRole: role,
          requestId,
        }
      );
      return res.status(403).send({
        errors: [{ message: "Your are not autherized to use this service." }],
      });
    } else if (role === "manager") {
      if (req.query.userid) {
        filter.userid = req.query.userid;
        logger.debug(
          `[${requestId}] Manager accessing specific user's loan applications`,
          {
            managerId: currentUserId,
            targetUserId: req.query.userid,
            requestId,
          }
        );
      } else {
        logger.debug(`[${requestId}] Manager accessing all loan applications`, {
          managerId: currentUserId,
          requestId,
        });
      }
    } else {
      logger.warn(`[${requestId}] Invalid user role detected`, {
        role,
        userId: currentUserId,
        requestId,
      });
      throw new BadRequestError("Invalid user role");
    }

    if (status) filter.status = status;
    if (bankId) filter.bankId = bankId;

    logger.debug(`[${requestId}] Fetching review applications from database`, {
      filter,
      requestId,
    });

    const review = await Review.find(filter).sort({ dateOfApplication: -1 });

    logger.info(`[${requestId}] Review applications retrieved successfully`, {
      totalCount: review.length,
      managerId: currentUserId,
      filters: filter,
      requestId,
    });

    res.status(200).send({ review });
  } catch (error) {
    if (error instanceof BadRequestError) {
      logger.warn(`[${requestId}] Bad request in review retrieval`, {
        error: error.message,
        userId: currentUserId,
        requestId,
      });
      throw error;
    }

    logger.error(`[${requestId}] Database error in review retrieval`, {
      error: error.message,
      stack: error.stack,
      userId: currentUserId,
      requestId,
    });
    throw new DatabaseConnectionError();
  }
};

module.exports = getAllLoans;
