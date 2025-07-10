class CustomError extends Error {
  constructor(message) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors() {
    throw new Error("serializeErrors method must be implemented");
  }
}

module.exports = { CustomError };
