const winston = require("winston");
const path = require("path");

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: level(),
  }),

  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/error.log"),
    level: "error",
    format: fileFormat,
  }),

  new winston.transports.File({
    filename: path.join(__dirname, "../../logs/combined.log"),
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
});

module.exports = logger;
