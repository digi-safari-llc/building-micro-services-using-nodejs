const { CustomError } = require("../errors/custom-error");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const requestId = Date.now().toString();

  logger.error(`[${requestId}] Error occurred`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    requestId,
  });

  if (err instanceof CustomError) {
    logger.warn(`[${requestId}] Custom error response`, {
      statusCode: err.statusCode,
      errors: err.serializeErrors(),
      requestId,
    });

    return res.status(err.statusCode).send({
      errors: err.serializeErrors(),
    });
  }

  logger.error(`[${requestId}] Unhandled error`, {
    error: err.message,
    stack: err.stack,
    requestId,
  });

  res.status(400).send({
    errors: [
      {
        message: err.message,
      },
    ],
  });
};

module.exports = { errorHandler };
