const { CustomError } = require("./custom-error");

class DatabaseConnectionError extends CustomError {
  constructor() {
    super("Error connecting to database");
    this.statusCode = 500;
    this.reason = "Error connecting to database";
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.reason,
      },
    ];
  }
}

module.exports = { DatabaseConnectionError };
