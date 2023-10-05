import { Client, REST, Routes } from 'discord.js';
import commandList from '../functions/commandList';
import { logger } from './logger';
import { config } from '../config';

async function main() {
  logger.info('Registering (/) commands...');

  const client = new Client({ intents: [], failIfNotExists: true });
  await client.login(config.botToken ?? config.devBotToken);

  const commandJSON = commandList.map((command) => command.data.toJSON());

  if (!client?.user) throw new Error('Client error');
  if (!config.botToken && !config.devBotToken) throw new Error('Missing token');

  await new REST()
    .setToken((config.botToken as string) ?? (config.devBotToken as string))
    .put(Routes.applicationCommands(client.user.id), { body: commandJSON })
    .then((_) => logger.info('Success!'))
    .catch((error) => logger.error(error.stack));

  process.exit();
}

main();
