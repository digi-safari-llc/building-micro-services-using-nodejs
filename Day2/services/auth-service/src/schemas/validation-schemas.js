const { z } = require("zod");

const signupSchema = z.object({
  name: z.string().min(1, "You must provide a name").trim(),
  email: z.string().email("Email must be valid"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .trim(),
  role: z.enum(["customer", "manager"]).default("customer").optional(),
});

const signinSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(1, "You must provide a password").trim(),
});

module.exports = {
  signupSchema,
  signinSchema,
};
