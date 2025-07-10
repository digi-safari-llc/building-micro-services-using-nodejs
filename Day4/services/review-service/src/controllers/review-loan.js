const { BadRequestError } = require("../errors/bad-request-error");
const { NotFoundError } = require("../errors/not-found-error");
const { Review } = require("../models/review");

const reviewLoan = async (req, res) => {
  console.log("\n[New log]:");

  const loanId = req.params.id;
  const { status } = req.body;
  const { role, id: currentUserId } = req.currentUser;

  console.log(loanId, status, role, currentUserId);

  if (!currentUserId) {
    throw new BadRequestError("Authentication required");
  }

  if (role !== "manager") {
    throw new BadRequestError("Only managers can update loan status");
  }

  console.log("Initial Validation Completed.");

  const review = await Review.findById(loanId);

  if (!review) {
    console.log("Loan not found!");
    throw new NotFoundError("Loan application not found!");
  }

  console.log("Loan found!");

  if (review.status !== "pending") {
    console.log("Loan status cannot be updated - already processed!");
    throw new BadRequestError(
      "This loan application has already been processed!"
    );
  }

  console.log(`Updating loan status from ${review.status} to ${status}...`);

  review.status = status;
  await review.save();

  console.log("Sending event to RabbitMQ.");

  const channel = req.rabbitChannel;

  const queueName = "loan_updated";

  const message = JSON.stringify({
    review,
  });

  channel.sendToQueue(queueName, Buffer.from(message), {
    persistent: true,
  });

  console.log("Successfully sent the event to RabbitMQ.");

  console.log("Loan status updated successfully.");

  res.status(200).send({
    success: [{ message: "Loan status updated successfully!" }],
    review,
  });
};

module.exports = reviewLoan;
