import { Client, REST, Routes } from 'discord.js';
import { log } from '../Helpers/Logger';
import { config } from '../config';
import commandList from './CommandExport';

async function main() {
  log.info('Registering (/) commands...');

  const client = new Client({ intents: [] });
  await client.login(config.botToken ?? config.devBotToken);

  const commandJSON = commandList.map((command) => {
    log.debug(`Adding command ${command.data.name}...`)
    return command.data.setDMPermission(false).toJSON()
  }
  );

  await new REST()
    .setToken(config.botToken ?? config.devBotToken)
    .put(Routes.applicationCommands(client.user!.id), { body: commandJSON })
    .then((_) => log.info('Success!'))
    .catch((error) => log.error(error));

  process.exit();
}

main();