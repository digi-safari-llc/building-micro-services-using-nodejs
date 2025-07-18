const express = require("express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");

require("dotenv").config();

const { errorHandler } = require("./middlewares/error-handler");
const { NotFoundError } = require("./errors/not-found-error");
const { signinRouter } = require("./routes/signin-route");
const { signupRouter } = require("./routes/signup-route");
const { signoutRouter } = require("./routes/signout-route");

const app = express();

app.use((req, res, next) => {
  const requestId = Date.now().toString();
  req.requestId = requestId;

  logger.http(`[${requestId}] Incoming request`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    requestId,
  });

  next();
});

app.use(express.json());

app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.use(async (req, res, next) => {
  logger.warn(`[${req.requestId}] Route not found`, {
    url: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });
  next(new NotFoundError());
});

app.use(errorHandler);

const start = async () => {
  const PORT = 8001;

  if (!process.env.JWT_KEY) {
    logger.error("JWT_KEY environment variable is not defined");
    throw new Error("JWT_KEY must be defined");
  }

  try {
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/PLMS-auth"
    );
    logger.info("Connected to MongoDB successfully", {
      database: "PLMS-Auth",
    });
  } catch (err) {
    logger.error("Failed to connect to MongoDB", {
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }

  app.listen(PORT, () => {
    logger.info("Auth service is running", {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
    });
  });
};

start().catch((err) => {
  logger.error("Failed to start Auth service", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
