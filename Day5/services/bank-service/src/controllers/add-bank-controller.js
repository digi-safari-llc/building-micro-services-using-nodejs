const { BadRequestError } = require("../errors/bad-request-error");
const { Bank } = require("../models/banks");
const logger = require("../utils/logger");

const addbank = async (req, res) => {
  const requestId = Date.now().toString();

  logger.info(`[${requestId}] Starting bank creation process`, {
    endpoint: "/api/banks/addbank",
    method: "POST",
    requestId,
  });

  try {
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

    logger.debug(`[${requestId}] Request body validation completed`, {
      bankName,
      minLoanAmount,
      maxLoanAmount,
      minInterestRate,
      maxInterestRate,
      minCreditScore,
      termLength,
      processingFee,
      rating,
      requestId,
    });

    logger.debug(
      `[${requestId}] Checking for existing bank with name: ${bankName}`
    );
    const existingBank = await Bank.findOne({ bankName });

    if (existingBank) {
      logger.warn(`[${requestId}] Bank creation failed - duplicate bank name`, {
        bankName,
        requestId,
      });
      throw new BadRequestError("A Bank with the same name already exists!");
    }

    if (minLoanAmount >= maxLoanAmount) {
      logger.warn(
        `[${requestId}] Bank creation failed - invalid loan amounts`,
        {
          minLoanAmount,
          maxLoanAmount,
          requestId,
        }
      );
      throw new BadRequestError(
        "Minimum Loan Amount can not be greater than the Maximum Loan Amount!"
      );
    }

    if (minInterestRate >= maxInterestRate) {
      logger.warn(
        `[${requestId}] Bank creation failed - invalid interest rates`,
        {
          minInterestRate,
          maxInterestRate,
          requestId,
        }
      );
      throw new BadRequestError(
        "Minimum Interest Rate can not be greater than the Maximum Interest Rate!"
      );
    }

    logger.info(`[${requestId}] Creating new bank entry`, {
      bankName,
      requestId,
    });

    const newBank = new Bank({
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
    });

    await newBank.save();

    logger.info(`[${requestId}] Bank created successfully`, {
      bankName,
      bankId: newBank._id,
      requestId,
    });

    res.status(201).send({
      success: [{ message: "Successfully created a Bank!" }],
    });
  } catch (error) {
    logger.error(`[${requestId}] Error creating bank`, {
      error: error.message,
      stack: error.stack,
      requestId,
    });
    throw error;
  }
};

module.exports = addbank;
