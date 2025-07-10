const { Loan } = require("../models/loans");

const saveLoans = async (msg) => {
  try {
    console.log("\n[New Log]:");

    const eventLoan = JSON.parse(msg.content.toString());

    console.log("Recieved the Loan Application.");

    const { loan } = eventLoan;

    const existingLoan = await Loan.findById(loan.id);

    if (existingLoan) {
      console.log("Loan data already exists!");
      return;
    }

    const newLoan = new Loan({
      _id: loan.id,
      ...loan,
    });

    console.log("New loan data built!");

    await newLoan.save();

    console.log("New loan data saved!");
  } catch (err) {
    console.log(err);
  }
};

module.exports = { saveLoans };
