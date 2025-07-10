const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./utils/logger");

require("dotenv").config();

const { getBankRouter } = require("./routes/get-bank-route");
const { addBankRouter } = require("./routes/add-bank-route");
const { errorHandler } = require("./middlewares/error-handler");
const { NotFoundError } = require("./errors/not-found-error");
const {
  DatabaseConnectionError,
} = require("./errors/database-connection-error");

const app = express();

app.enable("trust proxy");

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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(addBankRouter);
app.use(getBankRouter);

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
  const PORT = 8002;

  try {
    logger.info("Starting bank service...");

    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/PLMS-Bank"
    );
    logger.info("Connected to MongoDB successfully", {
      database: "PLMS-Bank",
    });

    app.listen(PORT, () => {
      logger.info(`Bank service is running`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
      });
    });
  } catch (err) {
    logger.error("Failed to start bank service", {
      error: err.message,
      stack: err.stack,
    });
    throw new DatabaseConnectionError();
  }

  app.listen(PORT, () => {
    logger.info("Notification service is running", {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
    });
  });
};

start().catch((err) => {
  logger.error("Failed to start notification service", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
