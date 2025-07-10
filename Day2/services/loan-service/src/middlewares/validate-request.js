const { ValidationError } = require("../errors/validation-error");

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error.errors) {
        throw new ValidationError(error.errors);
      }
      next(error);
    }
  };
};

module.exports = { validateRequest };
