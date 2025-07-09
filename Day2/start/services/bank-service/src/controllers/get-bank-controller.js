const getbank = async (req, res) => {
  console.log("\n[New log]:");

  console.log("Fetching all banks from memory.");

  try {
    const banks = global.banks;

    console.log(`Found ${banks.length} banks in memory.`);

    res.status(200).send({
      banks,
    });
  } catch (error) {
    console.log("Error fetching banks:", error.message);
    res.status(500).send({
      errors: [
        {
          message: "Error fetching banks from memory",
        },
      ],
    });
  }
};

module.exports = getbank;
