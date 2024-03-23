import { REST, Routes } from 'discord.js'
import { logger } from './Logger'
import { Bot } from '../Classes/Bot'
require('dotenv').config()

async function main() {
  logger.info('Registering (/) commands...')

  const client = new Bot({ intents: [] })
  await client.initialize()
  client.login(process.env.BOT_TOKEN)
  
  const commandJSON = client.commands.map(c => {
    logger.debug(`Adding command ${c.data.name}...`)
    return c.data.setDMPermission(false).toJSON()
  })

  if (!process.env.BOT_TOKEN) {
    logger.fatal('Provide a bot token in the .env file located in the root of the folder!')
    process.exit(1)
  }
    
  await client.login(process.env.BOT_TOKEN)
  
  await new REST()
    .setToken(process.env.BOT_TOKEN)
    .put(Routes.applicationCommands(client.user!.id), { body: commandJSON })
    .then(() => logger.info('Success!'))
    .catch((error) => logger.error(error))

  process.exit()
}

main()