import { Client, REST, Routes } from 'discord.js'
import { logger } from './Logger'
import commandList from './CommandExport'

async function main() {
  logger.info('Registering (/) commands...')

  const client = new Client({ intents: [] })
  
  const commandJSON = commandList.map((command) => {
    logger.debug(`Adding command ${command.data.name}...`)
    return command.data.setDMPermission(false).toJSON()
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