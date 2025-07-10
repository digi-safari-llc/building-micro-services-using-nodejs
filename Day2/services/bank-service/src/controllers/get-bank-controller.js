const {
  DatabaseConnectionError,
} = require("../errors/database-connection-error");
const { Bank } = require("../models/banks");

const getbank = async (req, res) => {
  console.log("\n[New log]:");

  console.log("Fetching all banks from memory.");

  try {
    const banks = await Bank.find({});

    console.log(`Found ${banks.length} banks in database.`);

    res.status(200).send({
      banks,
    });
  } catch (error) {
    console.log("Error fetching banks:", error.message);
    throw new DatabaseConnectionError();
  }
};

module.exports = getbank;
