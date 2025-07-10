const jwt = require("jsonwebtoken");

const currentUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      errors: [{ message: "Unautherized access." }],
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.currentUser = payload;
    next();
  } catch (error) {
    return res.status(401).send({
      errors: [{ message: "Please login again." }],
    });
  }
};

module.exports = { currentUser };
