const jwt = require("jsonwebtoken");
const { BadRequestError } = require("../errors/bad-request-error");
const { User } = require("../models/user");
const logger = require("../utils/logger");

const signup = async (req, res) => {
  const requestId = Date.now().toString();

  const { name, email, password } = req.body;

  logger.info(`[${requestId}] User signup attempt initiated`, {
    endpoint: "/api/users/signup",
    method: "POST",
    email,
    name,
    requestId,
  });

  try {
    logger.debug(`[${requestId}] Initial validation completed for signup`, {
      email,
      name,
      requestId,
    });

    logger.debug(`[${requestId}] Checking if email already exists`, {
      email,
      requestId,
    });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      logger.warn(`[${requestId}] Signup failed - email already in use`, {
        email,
        existingUserId: existingUser.id,
        requestId,
      });
      throw new BadRequestError("Email in use!");
    }

    logger.debug(`[${requestId}] Email available, creating new user`, {
      email,
      name,
      requestId,
    });

    const user = User.build({ name, email, password, role: "customer" });
    await user.save();

    logger.info(`[${requestId}] New user created successfully`, {
      email,
      name,
      userId: user.id,
      userRole: user.role,
      requestId,
    });

    const jwtPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    logger.debug(`[${requestId}] Creating JWT token for new user`, {
      userId: user.id,
      userRole: user.role,
      requestId,
    });

    const userJwt = jwt.sign(jwtPayload, process.env.JWT_KEY, {
      expiresIn: "10d",
    });
    logger.info(`[${requestId}] JWT token created and sent to new user`, {
      email,
      userId: user.id,
      userRole: user.role,
      requestId,
    });

    res.status(201).send({ token: userJwt });
  } catch (error) {
    if (error instanceof BadRequestError) {
      logger.warn(`[${requestId}] Bad request in signup process`, {
        error: error.message,
        email,
        requestId,
      });
      throw error;
    }

    logger.error(`[${requestId}] Signup process failed`, {
      error: error.message,
      stack: error.stack,
      email,
      requestId,
    });
    throw error;
  }
};

module.exports = signup;
