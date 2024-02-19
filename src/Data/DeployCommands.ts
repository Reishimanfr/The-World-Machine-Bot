import { Client, REST, Routes } from 'discord.js';
import { config } from '../config';
import commandList from './CommandExport';
import { logger } from '../config';

async function main() {
  logger.info('Registering (/) commands...');

  const client = new Client({ intents: [] });
  
  const commandJSON = commandList.map((command) => {
    logger.debug(`Adding command ${command.data.name}...`)
    return command.data.setDMPermission(false).toJSON()
  })
  
  const token = config.botToken ?? config.devBotToken
  
  if (!token) throw new Error('No tokens were provided. Double check the config.yml file and provide the botToken before running this script again.')
  
  await client.login(config.botToken ?? config.devBotToken);
  
  await new REST()
    .setToken(token)
    .put(Routes.applicationCommands(client.user!.id), { body: commandJSON })
    .then((_) => logger.info('Success!'))
    .catch((error) => logger.error(error));

  process.exit();
}

main();