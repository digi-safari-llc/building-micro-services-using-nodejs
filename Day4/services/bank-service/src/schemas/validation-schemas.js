const { z } = require("zod");

const addbankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required.").trim(),
  logo: z.string().url("Invalid URL."),
  minLoanAmount: z
    .number()
    .min(1000, "Minimum loan amount is too low for a loan."),
  maxLoanAmount: z
    .number()
    .min(1000, "Maximum loan amount is too low for a loan."),
  minInterestRate: z
    .number()
    .min(0.01, "Minimum interest rate can not be zero.")
    .max(100, "Interest rate cannot exceed 100%"),
  maxInterestRate: z
    .number()
    .min(0.02, "Maximum interest rate can not be zero.")
    .max(100, "Interest rate cannot exceed 100%"),
  minCreditScore: z
    .number()
    .min(300, "Minimum credit score must be at least 300")
    .max(850, "Credit score cannot exceed 850"),
  termLength: z.number().min(1, "Term length must be at least 1 month."),
  processingFee: z.number().min(0, "Processing fee must be non-negative."),
  rating: z
    .number()
    .min(0, "Rating must be non-negative.")
    .max(5, "Rating cannot exceed 5."),
});

module.exports = {
  addbankSchema,
};
