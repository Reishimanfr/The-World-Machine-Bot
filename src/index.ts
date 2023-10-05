require('dotenv').config();
import { GatewayIntentBits, Partials } from 'discord.js';
import { ExtClient, ExtPlayer } from './misc/twmClient';
import { Poru } from 'poru';
import { logger } from './misc/logger';
import {
  starboardBlacklistedChannels,
  starboardConfig,
  starboardEmojis,
} from './types/database_definition';
import { MessageReactionAdd, MessageReactionRemove } from './Events/MessageEvents';
import Ready from './Events/Ready';
import UpdateVoiceState from './Events/voiceStateUpdate';
import playerUpdate from './Events/playerUpdate';
import { trackStart } from './Events/trackStart';
import queueEnd from './Events/queueEnd';
import InteractionCreate from './Events/InteractionCreate';
import { poruNodes, poruOptions, config } from './config';
import { Sequelize } from 'sequelize';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('An unhandled rejection occured in the main process:');
  logger.error(reason);
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

async function syncDB() {
  for (const table of [starboardConfig, starboardEmojis, starboardBlacklistedChannels]) {
    console.log(`Syncing ${table.name}`);
    await table.sync();
  }
}

syncDB();

// Main events
client.once('ready', () => Ready());

client.on('interactionCreate', async (interaction) => {
  await InteractionCreate(interaction);
});

// Starboard events
client.on('messageReactionAdd', async (...args) => await MessageReactionAdd(...args));
client.on('messageReactionRemove', async (...args) => await MessageReactionRemove(...args));

// Music bot events
client.on(
  'voiceStateUpdate',
  async (oldState, newState) => await UpdateVoiceState(oldState, newState, client),
);

client.poru.on('nodeConnect', (node) => {
  logger.info(`${node.name} connected to lavalink server successfully.`);
});

client.poru.on('playerUpdate', (player: ExtPlayer) => {
  playerUpdate(player);
});

client.poru.on(
  'trackStart',
  async (player: ExtPlayer, track) => await trackStart(player, track, client),
);
client.poru.on('queueEnd', async (player: ExtPlayer) => queueEnd(player));
client.poru.on('trackEnd', (player: ExtPlayer) => (player.pauseEditing = true));

// Poru errors
client.poru.on('nodeError', (node, event) => {
  logger.error(
    `Node ${node.name} encountered a error. Attempting to reconnect in ${
      (poruOptions.reconnectTimeout ?? 0) / 1000
    }s`,
  );
  logger.error(event);
});

client.poru.on('trackError', (_$, _, error) => {
  logger.error(`Error while playing track`);
  logger.error(error);
});

// Login
if (!config.botToken && config.devBotToken) {
  logger.warn(
    "A bot token wasn't found, but a development token was. Overriding the enableDev variable and logging in with the developer token.",
  );
  client.login(config.devBotToken);
} else {
  client.login(config.enableDev ? config.devBotToken : config.botToken);
}
