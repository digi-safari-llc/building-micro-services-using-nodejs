const { CustomError } = require("./custom-error");

class ValidationError extends CustomError {
  constructor(zodErrors) {
    super("Invalid request parameters");
    this.statusCode = 400;
    this.zodErrors = zodErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors() {
    return this.zodErrors.map((error) => {
      return {
        message: error.message,
        field: error.path.join("."),
      };
    });
  }
}

module.exports = { ValidationError };
