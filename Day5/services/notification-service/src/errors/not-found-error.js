const { CustomError } = require("./custom-error");

class NotFoundError extends CustomError {
  constructor() {
    super("Route not Found");
    this.statusCode = 404;
    this.reason = "API Not Found";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.reason,
      },
    ];
  }
}

module.exports = { NotFoundError };
