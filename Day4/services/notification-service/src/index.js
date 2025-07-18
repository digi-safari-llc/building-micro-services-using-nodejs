const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib/callback_api");
const logger = require("./utils/logger");

require("dotenv").config();

const { NotFoundError } = require("./errors/not-found-error");
const { errorHandler } = require("./middlewares/error-handler");
const { getNotificationsRouter } = require("./routes/get-notifications-route");
const { markReadRouter } = require("./routes/mark-read-route");
const loanUpdated = require("./controllers/loan-updated");
const loanCreated = require("./controllers/loan-created");

amqp.connect(process.env.AMQP_CONNECT, (error0, connection) => {
  if (error0) {
    logger.error("Failed to connect to RabbitMQ", {
      error: error0.message,
      stack: error0.stack,
      amqpUrl: process.env.AMQP_CONNECT,
    });

    throw error0;
  }

  logger.info("Connected to RabbitMQ successfully");

  connection.createChannel((error1, channel) => {
    if (error1) {
      logger.error("Failed to create RabbitMQ channel", {
        error: error1.message,
        stack: error1.stack,
      });
      throw error1;
    }

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

    app.use((req, res, next) => {
      req.rabbitChannel = channel;
      next();
    });

    app.use(getNotificationsRouter);
    app.use(markReadRouter);

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
      const PORT = 8005;

      if (!process.env.JWT_KEY) {
        logger.error("JWT_KEY environment variable is not defined");
        throw new Error("JWT_KEY must be defined");
      }

      try {
        logger.info("Connecting to MongoDB...");
        await mongoose.connect(
          process.env.MONGODB_URI ||
            "mongodb://localhost:27017/PLMS-Notification"
        );
        logger.info("Connected to MongoDB successfully", {
          database: "PLMS-Notification",
        });
      } catch (err) {
        logger.error("Failed to connect to MongoDB", {
          error: err.message,
          stack: err.stack,
        });
        throw err;
      }

      logger.info("Setting up RabbitMQ queues...");

      channel.assertQueue("loan_updated", { durable: true }, (error) => {
        if (error) {
          logger.error("Failed to assert loan_updated queue", {
            error: error.message,
            stack: error.stack,
          });
          return;
        }

        logger.info("loan_updated queue asserted successfully");

        channel.consume(
          "loan_updated",
          (msg) => {
            loanUpdated(msg, channel);
          },
          { noAck: false }
        );

        logger.info("Started consuming loan_updated queue");
      });

      channel.assertQueue("loan_created", { durable: true }, (error) => {
        if (error) {
          logger.error("Failed to assert loan_created queue", {
            error: error.message,
            stack: error.stack,
          });
          return;
        }

        logger.info("loan_created queue asserted successfully");

        channel.consume(
          "loan_created",
          (msg) => {
            loanCreated(msg, channel);
          },
          { noAck: false }
        );

        logger.info("Started consuming loan_created queue");
      });

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

    process.on("beforeExit", () => {
      logger.info("Shutting down notification service...");
      logger.info("Closing RabbitMQ connection...");
      connection.close();
    });
  });
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
