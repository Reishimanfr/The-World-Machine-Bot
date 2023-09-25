import { Client, REST, Routes } from 'discord.js';
import commandList from '../bot_data/commandList';
import { logger } from './logger';

async function main() {
  logger.info('Registering (/) commands...');

  const client = new Client({ intents: [], failIfNotExists: true });
  await client.login(process.env.botToken ?? process.env.devBotToken);

  const commandJSON = commandList.map((command) => command.data.toJSON());

  if (!client?.user) throw new Error('Client error');
  if (!process.env.botToken && !process.env.devBotToken)
    throw new Error('Missing token');

  await new REST()
    .setToken(
      (process.env.botToken as string) ?? (process.env.devBotToken as string)
    )
    .put(Routes.applicationCommands(client.user.id), { body: commandJSON })
    .then((_) => logger.info('Success!'))
    .catch((error) => logger.error(error.stack));

  process.exit();
}

main();
