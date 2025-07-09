const signout = (req, res) => {
  console.log("\n[New log]:");

  req.session = null;

  console.log("Signed out the user!");

  res.send({});
};

module.exports = signout;
