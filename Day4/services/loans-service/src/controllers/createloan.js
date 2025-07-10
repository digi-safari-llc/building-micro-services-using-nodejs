const { BadRequestError } = require("../errors/bad-request-error");
const { Loan } = require("../models/loans");

const calculateInterestRate = (amount, loan) => {
  const amt = Number(amount);
  const { minLoanAmount, maxLoanAmount, minInterestRate, maxInterestRate } =
    loan;
  if (amt < minLoanAmount || amt > maxLoanAmount) return "";
  const fraction = (amt - minLoanAmount) / (maxLoanAmount - minLoanAmount);
  return (
    minInterestRate +
    fraction * (maxInterestRate - minInterestRate)
  ).toFixed(2);
};

const createloan = async (req, res) => {
  console.log("\n[New log]:");

  const { role, id: currentUserId } = req.currentUser;

  if (role !== "customer") {
    console.log("This service is for user only.");
    return res.status(403).send({
      errors: [{ message: "Your are not autherized to use this service." }],
    });
  }

  const {
    userid,
    updatedUserData,
    bankId,
    bankName,
    bankLogo,
    appliedLoanAmount,
    termLength,
    bankDetails,
  } = req.body;

  if (currentUserId !== userid) {
    return res.status(403).send({
      errors: [{ message: "You cannot apply loans for someone else." }],
    });
  }

  console.log("Initial Validation Completed.");

  console.log("Checking if the user has an existing loan that is pending...");

  const existingLoan = await Loan.findOne({
    userid,
    bankId,
    status: "pending",
  });

  if (existingLoan) {
    console.log("User already has a pending loan with this bank!");
    throw new BadRequestError(
      "You already have a pending loan application with this bank!"
    );
  }

  console.log("User has no pending loan with this bank!");

  const interestRate = calculateInterestRate(appliedLoanAmount, bankDetails);

  if (!interestRate) {
    console.log("Applied loan amount is outside bank's lending range!");
    throw new BadRequestError(
      "Applied loan amount is outside this bank's lending range!"
    );
  }

  if (updatedUserData.creditScore < bankDetails.minCreditScore) {
    console.log("Credit score doesn't meet bank's minimum requirement!");
    throw new BadRequestError(
      "Your credit score doesn't meet this bank's minimum requirement!"
    );
  }

  console.log("Creating new loan application...");

  const loan = Loan.build({
    userid,
    updatedUserData,
    bankId,
    bankName,
    bankLogo,
    appliedLoanAmount,
    interestRate: parseFloat(interestRate),
    termLength,
    status: "pending",
  });

  await loan.save();

  console.log("Loan application saved in database.");

  console.log("Sending event to RabbitMQ.");

  const channel = req.rabbitChannel;

  const queueName = "loan_created";

  const message = JSON.stringify({
    loan,
  });
  channel.assertQueue("loan_created", { durable: true }, (err) => {
    if (err) {
      console.error("Failed to assert queue", err);
      return;
    }
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });
  });

  console.log("Successfully sent the event to RabbitMQ.");

  res.status(201).send({
    success: [{ message: "Loan application submitted successfully!" }],
    loanId: loan.id,
  });
};

module.exports = createloan;
