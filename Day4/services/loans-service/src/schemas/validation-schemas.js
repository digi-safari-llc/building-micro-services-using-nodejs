const { z } = require("zod");

const createloanSchema = z.object({
  userid: z.string().min(1, "User ID is required").trim(),
  updatedUserData: z.object({
    name: z.string().min(1, "Name is required").trim(),
    dob: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    profileURL: z.string().url("Invalid profile URL"),
    gender: z.enum(["male", "female", "prefer not to say"], {
      errorMap: () => ({ message: "Invalid gender value" }),
    }),
    employer: z.string().min(1, "Employer is required").trim(),
    monthlySalary: z
      .number()
      .min(1000, "Monthly salary must be greater than 1000"),
    creditScore: z
      .number()
      .min(300, "Credit score must be at least 300")
      .max(900, "Credit score cannot exceed 900"),
  }),
  bankId: z.string().min(1, "Bank ID is required").trim(),
  bankName: z.string().min(1, "Bank name is required").trim(),
  bankLogo: z.string().url("Invalid bank logo URL"),
  appliedLoanAmount: z.number().min(1000, "Loan amount must be at least 1000"),
  termLength: z.number().min(1, "Term length must be at least 1 month"),
  bankDetails: z.object({
    minLoanAmount: z.number(),
    maxLoanAmount: z.number(),
    minInterestRate: z.number(),
    maxInterestRate: z.number(),
    minCreditScore: z.number(),
  }),
});

module.exports = {
  createloanSchema,
};
