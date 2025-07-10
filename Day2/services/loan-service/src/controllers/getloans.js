const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { BadRequestError } = require("../errors/bad-request-error");
const { Loan } = require("../models/loans");

const getloans = async (req, res) => {
  console.log("\n[New log]:");

  const { status, bankId } = req.query;
  const { role, id: currentUserId } = req.currentUser;

  console.log("Fetching loan applications from database.");

  try {
    let filter = {};

    if (role === "customer") {
      filter.userid = currentUserId;
      console.log("Customer accessing their own loan applications.");
    } else if (role === "manager") {
      console.log("This service is for user only.");
      return res.status(403).send({
        errors: [{ message: "Your are not autherized to use this service." }],
      });
    } else {
      throw new BadRequestError("Invalid user role");
    }

    if (status) filter.status = status;
    if (bankId) filter.bankId = bankId;

    const loans = await Loan.find(filter).sort({ dateOfApplication: -1 });

    console.log(`Found ${loans.length} loan applications in database.`);

    res.status(200).send({
      loans,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    console.log("Error fetching loans:", error.message);
    throw new DatabaseConnectionError();
  }
};

module.exports = getloans;
