const logger = require("../utils/logger");

const signout = (req, res) => {
  const requestId = Date.now().toString();

  logger.info(`[${requestId}] User signout initiated`, {
    endpoint: "/api/users/signout",
    method: "POST",
    userId: req.currentUser?.id,
    userRole: req.currentUser?.role,
    requestId,
  });

  try {
    logger.debug(`[${requestId}] Clearing user session`, {
      userId: req.currentUser?.id,
      requestId,
    });

    req.session = null;

    logger.info(`[${requestId}] User signed out successfully`, {
      userId: req.currentUser?.id,
      requestId,
    });

    res.send({});
  } catch (error) {
    logger.error(`[${requestId}] Signout process failed`, {
      error: error.message,
      stack: error.stack,
      userId: req.currentUser?.id,
      requestId,
    });
    throw error;
  }
};

module.exports = signout;
