import winston from 'winston';

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'magenta',
});

const format = winston.format.combine(
  winston.format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
  winston.format.align(),
  winston.format.colorize({ all: true }),
  winston.format.prettyPrint({ colorize: true }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`),
);

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({ format })],
});

export { logger };