const { Review } = require("../models/review");

const loanCreated = async (msg) => {
  try {
    console.log("\n[New Log]:");

    const eventLoan = JSON.parse(msg.content.toString());

    console.log("Recieved the Loan Application.");

    const { loan } = eventLoan;

    const existingReview = await Review.findById(loan.id);

    if (existingReview) {
      console.log("Review data already exists!");
      return;
    }

    const newReview = new Review({
      _id: loan.id,
      ...loan,
    });

    console.log("New loan data built!");

    await newReview.save();

    console.log("New loan data saved!");
  } catch (err) {
    console.log(err);
  }
};

module.exports = loanCreated;
