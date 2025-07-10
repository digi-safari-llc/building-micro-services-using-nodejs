const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { BadRequestError } = require("../errors/bad-request-error");
const { Loan } = require("../models/loans");
const logger = require("../utils/logger");

const getloans = async (req, res) => {
  const requestId = Date.now().toString();

  const { status, bankId } = req.query;
  const { role, id: currentUserId } = req.currentUser;

  logger.info(`[${requestId}] Loan retrieval request initiated`, {
    endpoint: "/api/loans",
    method: "GET",
    userId: currentUserId,
    userRole: role,
    queryParams: { status, bankId },
    requestId,
  });

  try {
    let filter = {};

    if (role === "customer") {
      filter.userid = currentUserId;
      logger.debug(
        `[${requestId}] Customer accessing their own loan applications`,
        {
          userId: currentUserId,
          filter,
          requestId,
        }
      );
    } else if (role === "manager") {
      logger.warn(
        `[${requestId}] Manager attempting to access user-only service`,
        {
          userId: currentUserId,
          userRole: role,
          requestId,
        }
      );
      return res.status(403).send({
        errors: [{ message: "Your are not autherized to use this service." }],
      });
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

    logger.debug(`[${requestId}] Fetching loan applications from database`, {
      filter,
      requestId,
    });

    const loans = await Loan.find(filter).sort({ dateOfApplication: -1 });

    logger.info(`[${requestId}] Loan applications retrieved successfully`, {
      totalCount: loans.length,
      userId: currentUserId,
      userRole: role,
      filters: filter,
      requestId,
    });

    res.status(200).send({ loans });
  } catch (error) {
    if (error instanceof BadRequestError) {
      logger.warn(`[${requestId}] Bad request in loan retrieval`, {
        error: error.message,
        userId: currentUserId,
        requestId,
      });
      throw error;
    }

    logger.error(`[${requestId}] Database error in loan retrieval`, {
      error: error.message,
      stack: error.stack,
      userId: currentUserId,
      requestId,
    });
    throw new DatabaseConnectionError();
  }
};

module.exports = getloans;
