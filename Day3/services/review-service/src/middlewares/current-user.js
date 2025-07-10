const jwt = require("jsonwebtoken");

const currentUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("Checking if Token is present.");

  if (!token) {
    return res.status(401).send({
      errors: [{ message: "Unautherized access." }],
    });
  }

  console.log("Token is present.");

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.currentUser = payload;
    console.log("Login Verified successfully!");

    next();
  } catch (error) {
    return res.status(401).send({
      errors: [{ message: "Please login again." }],
    });
  }
};

module.exports = { currentUser };
