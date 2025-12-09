import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), // ISO-8601 UTC format
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const log = {
      timestamp,
      level,
      service: 'tip-top-api',
      message,
      context: meta.context || {},
      ...(stack ? { stack } : {})
    };
    return JSON.stringify(log, (_, v) => typeof v === 'bigint' ? v.toString() : v);
  })
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'tip-top-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new winston.transports.Console({
//     format: winston.format.combine(
//       winston.format.colorize(),
//       winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
//         const log = {
//           timestamp,
//           level,
//           service: 'games-store-api',
//           message,
//           context: meta.context || {},
//           ...(stack ? { stack } : {})
//         };
//         return JSON.stringify(log, null, 2);
//       })
//     )
//   }));
// }

// Create a stream object for Morgan middleware
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};