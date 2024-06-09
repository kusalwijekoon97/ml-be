// utils/logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;

// Define the custom format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

// Create separate transports for access logs and error logs
const accessLogTransport = new transports.File({ filename: 'access.log' });
const errorLogTransport = new transports.File({ filename: 'error.log', level: 'error' });

// Create the logger
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        new transports.Console(), // Log to console as well
        accessLogTransport, // Log access logs to access.log file
        errorLogTransport // Log error logs to error.log file
    ],
});

module.exports = logger;
