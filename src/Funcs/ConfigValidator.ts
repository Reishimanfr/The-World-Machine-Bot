import { logger } from '../Helpers/Logger'
require('dotenv').config()

export async function validateConfig() {
  // Fatal errors
  if (!process.env.BOT_TOKEN) {
    logger.fatal('Provide a bot token in the .env file located in the root of the folder!')
    process.exit(1)
  }
  
  if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(process.env.LOG_LEVEL)) {
    logger.fatal('Invalid log level provided in the.env file! Valid levels are: trace, debug, info, warn, error, fatal')
    process.exit(1)
  }
  
  if (isNaN(Number(process.env.LAVALINK_PORT))) {
    logger.fatal('Invalid value for LAVALINK_PORT provided in the.env file! Value must be a number.')
    process.exit(1)
  }
  
  if (isNaN(Number(process.env.PLAYER_TIMEOUT))) {
    logger.fatal('Invalid value for PLAYER_TIMEOUT provided in the.env file! Value must be a number.')
    process.exit(1)
  }
  
  if (isNaN(Number(process.env.DATABASE_PORT))) {
    logger.fatal('Invalid value for DATABASE_PORT provided in the.env file! Value must be a number.')
    process.exit(1) 
  }
  
  if (!process.env.TENOR_API_KEY) {
    logger.warn('You haven\'t provided a tenor API key. The starboard won\'t be able to embed tenor gifs!')
  }
}