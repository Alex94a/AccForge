import winston from 'winston';

/**
 * Logger class to handle logging activities for different services.
 */
export class Logger {
    constructor(service, level = 'info') {
        this.logger = winston.createLogger({
            level, // Set the log level dynamically
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp }) => 
                    `[${timestamp}] [${level}] [${service}]: ${message}`
                )
            ),
            transports: [
                new winston.transports.Console({ 
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.timestamp(),
                        winston.format.printf(({ level, message, timestamp }) => 
                            `[${timestamp}] [${level}] [${service}]: ${message}`
                        )
                    ) 
                })
            ]
        });
    }

    info(message) { this.logger.info(message); }
    warn(message) { this.logger.warn(message); }
    error(message) { this.logger.error(message); }
}
