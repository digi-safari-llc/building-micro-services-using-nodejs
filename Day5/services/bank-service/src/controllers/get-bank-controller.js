const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { Bank } = require("../models/banks");
const logger = require("../utils/logger");

const getbank = async (req, res) => {
  const requestId = Date.now().toString();
  logger.info(`[${requestId}] Starting bank retrieval process`, {
    endpoint: "/api/banks/getbank",
    method: "GET",
    requestId,
  });

  try {
    logger.debug(`[${requestId}] Fetching all banks from database`);

    const banks = await Bank.find({});

    logger.info(`[${requestId}] Successfully retrieved banks`, {
      count: banks.length,
      requestId,
    });

    logger.debug(`[${requestId}] Bank retrieval details`, {
      bankNames: banks.map((bank) => bank.bankName),
      requestId,
    });

    res.status(200).send({
      banks,
    });
  } catch (error) {
    logger.error(`[${requestId}] Error fetching banks`, {
      error: error.message,
      stack: error.stack,
      requestId,
    });
    throw new DatabaseConnectionError();
  }
};

module.exports = getbank;
