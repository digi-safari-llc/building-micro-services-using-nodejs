const jwt = require("jsonwebtoken");
const { Password } = require("../controllers/password");
const { BadRequestError } = require("../errors/bad-request-error");
const { User } = require("../models/user");
const logger = require("../utils/logger");

const signin = async (req, res) => {
  const requestId = Date.now().toString();

  const { email, password } = req.body;

  logger.info(`[${requestId}] User signin attempt initiated`, {
    endpoint: "/api/users/signin",
    method: "POST",
    email,
    requestId,
  });

  try {
    logger.debug(`[${requestId}] Initial validation completed for signin`, {
      email,
      requestId,
    });

    logger.debug(`[${requestId}] Searching for user by email`, {
      email,
      requestId,
    });

    if (!existingUser) {
      logger.warn(`[${requestId}] Signin failed - email not found`, {
        email,
        requestId,
      });
      throw new BadRequestError("No user found with this email.");
    }

    logger.debug(`[${requestId}] User found, verifying password`, {
      email,
      userId: existingUser.id,
      userRole: existingUser.role,
      requestId,
    });

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      logger.warn(`[${requestId}] Signin failed - incorrect password`, {
        email,
        userId: existingUser.id,
        requestId,
      });
      throw new BadRequestError("Invalid Credentials.");
    }

    logger.info(`[${requestId}] Password verification successful`, {
      email,
      userId: existingUser.id,
      userRole: existingUser.role,
      requestId,
    });

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        dob: existingUser.dob || "",
        profileURL: existingUser.profileURL || "/image.webp",
        gender: existingUser.gender || "other",
        employer: existingUser.employer || "",
        monthlySalary: existingUser.monthlySalary || 0,
        creditScore: existingUser.creditScore || 0,
      },
      process.env.JWT_KEY,
      { expiresIn: "10d" }
    );

    logger.info(`[${requestId}] JWT token created and sent to user`, {
      email,
      userId: existingUser.id,
      userRole: existingUser.role,
      requestId,
    });

    res.status(200).send({ token: userJwt });
  } catch (error) {
    if (error instanceof BadRequestError) {
      logger.warn(`[${requestId}] Bad request in signin process`, {
        error: error.message,
        email,
        requestId,
      });
      throw error;
    }

    logger.error(`[${requestId}] Signin process failed`, {
      error: error.message,
      stack: error.stack,
      email,
      requestId,
    });
    throw error;
  }
};

module.exports = signin;
