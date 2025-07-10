const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const amqp = require("amqplib/callback_api");
const logger = require("./utils/logger");

require("dotenv").config();

const { errorHandler } = require("./middlewares/error-handler");
const { NotFoundError } = require("./errors/not-found-error");
const { signinRouter } = require("./routes/signin-route");
const { signupRouter } = require("./routes/signup-route");
const { signoutRouter } = require("./routes/signout-route");

amqp.connect(process.env.AMQP_CONNECT, function (error0, connection) {
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

    app.use((req, res, next) => {
      req.rabbitChannel = channel;
      next();
    });

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

      channel.assertQueue("loan_created", { durable: true }, (error) => {
        if (error) {
          console.error("Queue assertion error:", error);
          return;
        }

        logger.info("Asserted 'loan_created' queue");

        channel.consume(
          "loan_created",
          (msg) => {
            loanCreated(msg, channel);
          },
          { noAck: false }
        );
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
      logger.info("Closing Connection to RabbitMQ!");
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
