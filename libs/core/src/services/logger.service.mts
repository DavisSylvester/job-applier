import winston from "winston";

export const createLogger = (env: string = "development") => {
  const logger = winston.createLogger({
    level: env === "development" ? "debug" : "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level}]: ${message}`;
          }),
        ),
      }),
    ],
  });

  return logger;
};

// Create a default logger instance
export const logger = createLogger(process.env.NODE_ENV || "development");
