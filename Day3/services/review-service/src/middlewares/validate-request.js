const { ValidationError } = require("../errors/validation-error");

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      console.log("Schema match!");
      next();
    } catch (error) {
      if (error.errors) {
        console.log("Schema no match!");

        throw new ValidationError(error.errors);
      }
      next(error);
    }
  };
};

module.exports = { validateRequest };
