const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const amqp = require("amqplib/callback_api");
require("dotenv").config();

const { NotFoundError } = require("./errors/not-found-error");
const { errorHandler } = require("./middlewares/error-handler");
const { createloanRouter } = require("./routes/createloan-route");
const { getloansRouter } = require("./routes/getloans-route");
const { saveLoans } = require("./controllers/saveloans");
const { updateLoans } = require("./controllers/updatedLoans");

amqp.connect(process.env.AMQP_CONNECT, (error0, connection) => {
  if (error0) {
    throw error0;
  }

  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }

    const app = express();

    app.enable("trust proxy");

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

    app.use(createloanRouter);
    app.use(getloansRouter);

    app.use(async (req, res, next) => {
      next(new NotFoundError());
    });

    app.use(errorHandler);

    const start = async () => {
      const PORT = 8003;

      if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
      }

      try {
        await mongoose.connect("mongodb://localhost:27017/PLMS-Loans");
        console.log("Connected to MongoDB :]");
      } catch (err) {
        console.log(err);
      }

      channel.assertQueue("loan_created", { durable: true }, (error) => {
        if (error) {
          console.error("Queue assertion error:", error);
          return;
        }

        console.log("Asserted 'loan_created' queue");

        channel.consume("loan_created", saveLoans, { noAck: false });
      });

      channel.assertQueue("loan_updated", { durable: true }, (error) => {
        if (error) {
          console.error("Queue assertion error:", error);
          return;
        }

        console.log("Asserted 'loan_updated' queue");

        channel.consume("loan_updated", updateLoans, { noAck: false });
      });

      app.listen(PORT, () => {
        console.log("Listening on port 8003");
      });
    };

    start();

    process.on("beforeExit", () => {
      console.log("Closing Connection to RabbitMQ!");
      connection.close();
    });
  });
});
