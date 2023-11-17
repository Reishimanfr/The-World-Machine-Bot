import { Client, REST, Routes } from 'discord.js';
import { config } from '../config';
import commandList from './CommandExport';
import { logger } from './Logger';

async function main() {
  logger.info('Registering (/) commands...');

  const client = new Client({ intents: [] });
  await client.login(config.botToken ?? config.devBotToken);

  const commandJSON = commandList.map((command) => command.data.setDMPermission(false).toJSON());

  await new REST()
    .setToken(config.botToken ?? config.devBotToken)
    .put(Routes.applicationCommands(client.user!.id), { body: commandJSON })
    .then((_) => logger.info('Success!'))
    .catch((error) => logger.error(error));

  process.exit();
}

main();