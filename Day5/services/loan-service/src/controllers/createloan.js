const { BadRequestError } = require("../errors/bad-request-error");
const { Loan } = require("../models/loans");
const logger = require("../utils/logger");

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
  const requestId = Date.now().toString();

  const { role, id: currentUserId } = req.currentUser;

  logger.info(`[${requestId}] Loan creation request initiated`, {
    endpoint: "/api/loans",
    method: "POST",
    userId: currentUserId,
    userRole: role,
    requestId,
  });

  try {
    if (role !== "customer") {
      logger.warn(`[${requestId}] Unauthorized loan creation attempt`, {
        userId: currentUserId,
        userRole: role,
        requestId,
      });
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

    logger.debug(`[${requestId}] Loan creation request data`, {
      userid,
      bankId,
      bankName,
      appliedLoanAmount,
      termLength,
      requestId,
    });

    if (currentUserId !== userid) {
      logger.warn(`[${requestId}] Attempt to apply loan for another user`, {
        currentUserId,
        targetUserId: userid,
        requestId,
      });
      return res.status(403).send({
        errors: [{ message: "You cannot apply loans for someone else." }],
      });
    }

    logger.debug(`[${requestId}] Initial validation completed`, {
      userId: userid,
      bankId,
      appliedLoanAmount,
      requestId,
    });

    logger.debug(`[${requestId}] Checking for existing pending loan`, {
      userid,
      bankId,
      requestId,
    });

    if (existingLoan) {
      logger.warn(`[${requestId}] Duplicate loan application attempt`, {
        userId: userid,
        bankId,
        existingLoanId: existingLoan.id,
        requestId,
      });
      throw new BadRequestError(
        "You already have a pending loan application with this bank!"
      );
    }

    logger.debug(`[${requestId}] No existing pending loan found`, {
      userid,
      bankId,
      requestId,
    });

    logger.debug(`[${requestId}] Calculating interest rate`, {
      appliedLoanAmount,
      minLoanAmount: bankDetails.minLoanAmount,
      maxLoanAmount: bankDetails.maxLoanAmount,
      requestId,
    });

    const interestRate = calculateInterestRate(appliedLoanAmount, bankDetails);

    if (!interestRate) {
      logger.warn(`[${requestId}] Loan amount outside bank's lending range`, {
        userId: userid,
        bankId,
        appliedLoanAmount,
        minAmount: bankDetails.minLoanAmount,
        maxAmount: bankDetails.maxLoanAmount,
        requestId,
      });
      throw new BadRequestError(
        "Applied loan amount is outside this bank's lending range!"
      );
    }

    logger.debug(`[${requestId}] Interest rate calculated`, {
      appliedLoanAmount,
      interestRate,
      requestId,
    });

    logger.debug(`[${requestId}] Checking credit score requirement`, {
      userCreditScore: updatedUserData.creditScore,
      minRequired: bankDetails.minCreditScore,
      requestId,
    });

    if (updatedUserData.creditScore < bankDetails.minCreditScore) {
      logger.warn(`[${requestId}] Credit score below minimum requirement`, {
        userId: userid,
        bankId,
        userCreditScore: updatedUserData.creditScore,
        minRequired: bankDetails.minCreditScore,
        requestId,
      });
      throw new BadRequestError(
        "Your credit score doesn't meet this bank's minimum requirement!"
      );
    }

    logger.debug(`[${requestId}] Creating new loan application`, {
      userId: userid,
      bankId,
      appliedLoanAmount,
      interestRate,
      requestId,
    });

    const loanData = {
      userid,
      updatedUserData,
      bankId,
      bankName,
      bankLogo,
      appliedLoanAmount,
      interestRate: parseFloat(interestRate),
      termLength,
      status: "pending",
    };

    const loan = Loan.build(loanData);
    await loan.save();

    logger.info(`[${requestId}] Loan application saved successfully`, {
      userId: userid,
      loanId: loan.id,
      bankId,
      bankName,
      appliedLoanAmount,
      interestRate,
      requestId,
    });

    logger.debug(`[${requestId}] Sending loan created event to RabbitMQ`, {
      loanId: loan.id,
      queue: "loan_created",
      requestId,
    });

    const channel = req.rabbitChannel;
    const queueName = "loan_created";
    const message = JSON.stringify({ loan });

    channel.assertQueue("loan_created", { durable: true }, (err) => {
      if (err) {
        logger.error(`[${requestId}] Failed to assert RabbitMQ queue`, {
          error: err.message,
          queueName,
          requestId,
        });
        return;
      }
      channel.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
      });
    });

    logger.info(
      `[${requestId}] Loan created event sent to RabbitMQ successfully`,
      {
        loanId: loan.id,
        queue: queueName,
        requestId,
      }
    );

    res.status(201).send({
      success: [{ message: "Loan application submitted successfully!" }],
      loanId: loan.id,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      logger.warn(`[${requestId}] Bad request in loan creation`, {
        error: error.message,
        userId: currentUserId,
        bankId: req.body?.bankId,
        requestId,
      });

      throw error;
    }

    logger.error(`[${requestId}] Loan creation failed`, {
      error: error.message,
      stack: error.stack,
      userId: currentUserId,
      bankId: req.body?.bankId,
      requestId,
    });

    throw error;
  }
};

module.exports = createloan;
