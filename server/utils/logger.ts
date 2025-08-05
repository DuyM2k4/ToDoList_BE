import { config } from "dotenv";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Set level
const LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Set environment 
const ENV_LOG_LEVEL = 'debug'
const LogLevel = ENV_LOG_LEVEL || "info"
// const LogLevel = process.env.LOG_LEVEL || 'info';

// Set format to print
export const customLogFormat = winston.format.printf(
      ({ timestamp, level, endpoint, message, logMetadata, stack }) => {
        return `${timestamp} ${level.toUpperCase()} ${endpoint || ''}: ${logMetadata || ''} ${message} ${stack || ""}`;
      });

// Base format
const baseFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
    // winston.format.timestamp(),
    // winston.format.json()
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
  customLogFormat
);

// Set file rotate
const fileRotateTransport = new DailyRotateFile({
  filename: "server/log/application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  format: baseFormat
});
    
// Create logger
const logger = winston.createLogger({
  levels: LogLevels,
  level: LogLevel,
  format: baseFormat,
  transports: [new winston.transports.Console(), fileRotateTransport]
})

export default logger;