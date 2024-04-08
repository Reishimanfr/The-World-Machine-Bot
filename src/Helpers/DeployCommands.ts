import { logger } from './Logger'
import { Bot } from '../Classes/Bot'
require('dotenv').config()

async function main() {
  if (!process.env.BOT_TOKEN) {
    logger.fatal('Provide a bot token in the .env file located in the root of the folder!')
    process.exit(1)
  }

  const client = new Bot({ intents: [] })
  await client.registerCommands(process.env.BOT_TOKEN)
}

main()