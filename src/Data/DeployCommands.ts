import { Client, REST, Routes } from 'discord.js';
import { logger } from '../Helpers/Logger';
import { config } from '../config';
import commandList from './CommandExport';

async function main() {
  logger.info('Registering (/) commands...');

  const client = new Client({ intents: [] });
  await client.login(config.botToken ?? config.devBotToken);

  const commandJSON = commandList.map((command) => {
    logger.debug(`Adding command ${command.data.name}...`)
    return command.data.setDMPermission(false).toJSON()
  }
  );

  await new REST()
    .setToken(config.botToken ?? config.devBotToken)
    .put(Routes.applicationCommands(client.user!.id), { body: commandJSON })
    .then((_) => logger.info('Success!'))
    .catch((error) => logger.error(error));

  process.exit();
}

main();