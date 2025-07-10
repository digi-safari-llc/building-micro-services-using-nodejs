const { BadRequestError } = require("../errors/bad-request-error");
const { Bank } = require("../models/banks");

const addbank = async (req, res) => {
  console.log("\n[New log]:");

  const {
    bankName,
    logo,
    minLoanAmount,
    maxLoanAmount,
    minInterestRate,
    maxInterestRate,
    minCreditScore,
    termLength,
    processingFee,
    rating,
  } = req.body;

  console.log("Initial Validation Completed.");

  const existingBank = await Bank.findOne({ bankName });

  if (existingBank) {
    console.log("A Bank with the same name already exists!");
    throw new BadRequestError("A Bank with the same name already exists!");
  }

  if (minLoanAmount >= maxLoanAmount) {
    console.log("Minimum Loan Amount is greater than Maximum Loan Amount!");
    throw new BadRequestError(
      "Minimum Loan Amount can not be greater than the Maximum Loan Amount!"
    );
  }

  if (minInterestRate >= maxInterestRate) {
    console.log("Minimum Interest Rate is greater than Maximum Interest Rate!");
    throw new BadRequestError(
      "Minimum Interest Rate can not be greater than the Maximum Interest Rate!"
    );
  }

  console.log("Creating new bank entry...");

  const newBank = {
    id: Date.now().toString(),
    bankName,
    logo,
    minLoanAmount,
    maxLoanAmount,
    minInterestRate,
    maxInterestRate,
    minCreditScore,
    termLength,
    processingFee,
    rating,
  };

  await bank.save();

  console.log("Bank data saved in memory.");

  res
    .status(201)
    .send({ success: [{ message: "Successfully created a Bank!" }] });
};

module.exports = addbank;
