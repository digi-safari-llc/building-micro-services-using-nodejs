const jwt = require("jsonwebtoken");

const { Password } = require("../controllers/password");

const { BadRequestError } = require("../errors/bad-request-error");

const { User } = require("../models/user");

const signin = async (req, res) => {
  console.log("\n[New log]:");

  const { email, password } = req.body;

  console.log("Initial Validation Completed.");

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    console.log("Email not in use.");
    throw new BadRequestError("No user found with this email.");
  }

  console.log("Email found, checking for password.");

  const passwordsMatch = await Password.compare(
    existingUser.password,
    password
  );

  if (!passwordsMatch) {
    console.log("Password found to be incorrect.");
    throw new BadRequestError("Invalid Credentials.");
  }

  console.log("Password matched.");

  console.log(`Assigned ${existingUser.role} role to user.`);

  const userJwt = jwt.sign(
    {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    },
    process.env.JWT_KEY,
    { expiresIn: "10d" }
  );

  console.log("JWT created!");

  console.log("Token sent to the user!");

  res.status(200).send({ token: userJwt });
};

module.exports = signin;
