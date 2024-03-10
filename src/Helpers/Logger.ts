import pino from 'pino'
require('dotenv').config()

export const logger = pino({
  level: process.env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: true,
      ignore: 'pid,hostname',
      singleLine: true,
    }
  }
})
