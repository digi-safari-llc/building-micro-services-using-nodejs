const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { BadRequestError } = require("../errors/bad-request-error");
const { Review } = require("../models/review");

const getAllLoans = async (req, res) => {
  console.log("\n[New log]:");

  const { status, bankId } = req.query;
  const { role } = req.currentUser;

  console.log("Fetching loan applications from database.");

  try {
    let filter = {};

    if (role === "customer") {
      console.log("This service is for user only.");
      return res.status(403).send({
        errors: [{ message: "Your are not autherized to use this service." }],
      });
    } else if (role === "manager") {
      if (req.query.userid) filter.userid = req.query.userid;
      console.log("Manager accessing all loan applications.");
    } else {
      throw new BadRequestError("Invalid user role");
    }

    if (status) filter.status = status;
    if (bankId) filter.bankId = bankId;

    const review = await Review.find(filter).sort({ dateOfApplication: -1 });

    console.log(`Found ${review.length} loan applications in database.`);

    res.status(200).send({
      review,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    console.log("Error fetching loans:", error.message);
    throw new DatabaseConnectionError();
  }
};

module.exports = getAllLoans;
