import { logger } from '../Helpers/Logger'
require('dotenv').config()

export async function validateConfig() {
  const VALID_BOOLEAN_VALUES = ['true', 'false', '0', '1']

  // Fatal errors
  if (!process.env.BOT_TOKEN) {
    logger.fatal('Provide a bot token in the .env file located in the root of the folder!')
    process.exit(1)
  }
  
  if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(process.env.LOG_LEVEL)) {
    logger.fatal('Invalid log level provided in the.env file! Valid levels are: trace, debug, info, warn, error, fatal')
    process.exit(1)
  }
  
  if (!VALID_BOOLEAN_VALUES.includes(process.env.AUTOSTART_LAVALINK)) {
    logger.fatal('Invalid value for AUTOSTART_LAVALINK provided in the .env file! Value must be a boolean.')
    process.exit(1)
  }
  
  if (!VALID_BOOLEAN_VALUES.includes(process.env.PIPE_LAVALINK_STDOUT)) {
    logger.fatal('Invalid value for PIPE_LAVALINK_STDOUT provided in the.env file! Value must be a boolean.')
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
  
  // Warnings
  if (!process.env.STEAM_API_KEY) {
    logger.warn('You haven\'t provided a steam API key. The /tf2 command will NOT work!')
  }
  
  if (!process.env.TENOR_API_KEY) {
    logger.warn('You haven\'t provided a tenor API key. The starboard won\'t be able to embed tenor gifs!')
  }
}