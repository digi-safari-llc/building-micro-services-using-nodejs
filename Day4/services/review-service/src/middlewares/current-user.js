const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const currentUser = (req, res, next) => {
  const requestId = Date.now().toString();

  const token = req.headers.authorization?.split(" ")[1];

  logger.debug(`[${requestId}] Checking authentication token`, {
    hasToken: !!token,
    endpoint: req.originalUrl,
    method: req.method,
    requestId,
  });

  if (!token) {
    logger.warn(`[${requestId}] Authentication failed - no token provided`, {
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      requestId,
    });
    return res.status(401).send({
      errors: [{ message: "Unauthorized access." }],
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.currentUser = payload;
    req.requestId = requestId;

    logger.debug(`[${requestId}] Authentication successful`, {
      userId: payload.id,
      userRole: payload.role,
      endpoint: req.originalUrl,
      method: req.method,
      requestId,
    });

    next();
  } catch (error) {
    logger.warn(`[${requestId}] Authentication failed - invalid token`, {
      error: error.message,
      endpoint: req.originalUrl,
      method: req.method,
      ip: req.ip,
      requestId,
    });

    return res.status(401).send({
      errors: [{ message: "Please login again." }],
    });
  }
};

module.exports = { currentUser };
