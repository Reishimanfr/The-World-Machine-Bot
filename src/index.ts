import { GatewayIntentBits, Partials } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { Poru } from 'poru';
import tables from './Helpers/DatabaseSchema';
import { ExtClient } from './Helpers/ExtendedClient';
import { logger } from './Helpers/Logger';
import { config, poruNodes, poruOptions } from './config';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('An unhandled rejection occured in the main process:');
  logger.error(reason);
  logger.error(promise)
});

process.on('uncaughtException', (error) => {
  logger.error('An uncaught exception occurred in the main process:');
  logger.error(error.stack ? `${error.stack}` : `${error}`);
});

process.on('uncaughtExceptionMonitor', (error) => {
  logger.error('An uncaught exception monitor occurred in the main process:');
  logger.error(error.stack ? `${error.stack}` : `${error}`);
});

export const client = new ExtClient({
  failIfNotExists: true,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    // These allow you to recieve interactions on old messages for example
    Partials.Reaction,
    Partials.Message,
  ],
});

client.poru = new Poru(client, poruNodes, poruOptions);

tables.forEach(async (t) => await t.sync());

const poruEventPath = path.join(__dirname, './Events/Poru')
const eventPath = path.join(__dirname, './Events/Bot')

const poruEvents = fs
.readdirSync(poruEventPath)
.filter((f) => f.endsWith('.ts'));

const botEvents = fs
  .readdirSync(eventPath)
  .filter((f) => f.endsWith('.ts'));

for (const file of botEvents) {
  const filePath = path.join(eventPath, file)
  const event = require(filePath).default

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

for (const file of poruEvents) {
  const filePath = path.join(poruEventPath, file)
  const event = require(filePath).default

  if (event.once) {
    client.poru.once(event.name, (...args) => event.execute(...args))
  } else {
    client.poru.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(config.botToken ?? config.devBotToken)
