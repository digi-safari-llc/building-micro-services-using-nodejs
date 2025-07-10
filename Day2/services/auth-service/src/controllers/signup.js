const jwt = require("jsonwebtoken");

const { BadRequestError } = require("../errors/bad-request-error");
const { User } = require("../models/user");

const signup = async (req, res) => {
  console.log("\n[New log]:");

  const { name, email, password } = req.body;

  console.log("Initial Validation Completed.");

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log("Email in use!");
    throw new BadRequestError("Email in use!");
  }

  console.log("Email not in use, creating a new user.");

  const user = User.build({ name, email, password, role: "customer" });
  await user.save();

  console.log("User data saved in database.");

  const userJwt = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_KEY,
    { expiresIn: "10d" }
  );

  console.log("JWT created!");

  console.log("Token sent to the user!");

  res.status(201).send({ token: userJwt });
};

module.exports = signup;
