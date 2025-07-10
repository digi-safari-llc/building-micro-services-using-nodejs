const { Loan } = require("../models/loans");

const updateLoans = async (msg) => {
  try {
    console.log("\n[New Log]:");

    const eventData = JSON.parse(msg.content.toString());

    console.log("Received the Loan Status Update.");

    const { review } = eventData;

    const existingLoan = await Loan.findById(review.id);

    if (!existingLoan) {
      console.log("Loan not found in database!");
      return;
    }

    console.log(
      `Updating loan status from ${existingLoan.status} to ${review.status}`
    );

    existingLoan.status = review.status;
    await existingLoan.save();

    console.log("Loan status updated successfully!");

    msg.ack();
  } catch (err) {
    console.log("Error updating loan status:", err);
    msg.nack(false, true);
  }
};

module.exports = { updateLoans };
