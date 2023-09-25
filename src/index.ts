require('dotenv').config();
import { GatewayIntentBits, InteractionType, Partials } from 'discord.js';
import { ExtClient, ExtPlayer } from './misc/twmClient';
import { Poru, PoruOptions, NodeGroup } from 'poru';
import { logger } from './misc/logger';
import {
  starboardConfig,
  starboardEmojis,
  starboardEntries,
} from './types/database_definition';
import { MessageReactionAdd, MessageReactionRemove } from './Events/MessageEvents';
import Ready from './Events/Ready';
import UpdateVoiceState from './Events/voiceStateUpdate';
import Command from './Events/EventHelpers/Command';
import Button from './Events/EventHelpers/Button';
import MessageDelete from './Events/MessageDelete';
import playerUpdate from './Events/playerUpdate';
import { trackStart } from './Events/trackStart';
import queueEnd from './Events/queueEnd';

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

const Nodes: NodeGroup[] = [
  {
    name: 'lambda',
    host: 'localhost',
    port: 2333,
    password: 'MyPassword',
  },
  {
    name: 'alpha',
    host: 'localhost',
    port: 2333,
    password: 'MyPassword',
  },
];

const PoruOption: PoruOptions = {
  library: 'discord.js',
  defaultPlatform: 'ytsearch',
  autoResume: true,
  reconnectTimeout: 60000,
  reconnectTries: 20,
};

client.poru = new Poru(client, Nodes, PoruOption);

async function main() {
  logger.debug('Debug mode enabled.');

  for (const table of [starboardConfig, starboardEmojis, starboardEntries]) {
    logger.info(`[SEQUELIZE]: Syncing table ${table.name}...`);
    await table
      .sync()
      .then((_) => logger.info('          | Success!'))
      .catch((e) => logger.error(`          | Error: ${e.stack}`));
  }

  client.once('ready', () => Ready());

  client.on('interactionCreate', async (interaction) => {
    if (interaction.type == InteractionType.ApplicationCommand) {
      await Command(interaction);
    } else if (interaction.type == InteractionType.MessageComponent) {
      if (interaction.isButton()) {
        await Button(interaction);
      }
    }
  });

  client.on('messageDelete', async (message) => await MessageDelete(message));

  // Starboard stuff
  client.on(
    'messageReactionAdd',
    async (reaction, user) => await MessageReactionAdd(reaction, user, client)
  );

  client.on(
    'messageReactionRemove',
    async (reaction, user) => await MessageReactionRemove(reaction, user, client)
  );

  client.on(
    'voiceStateUpdate',
    async (oldState, newState) => await UpdateVoiceState(oldState, newState, client)
  );

  client.login(process.env.botToken ?? process.env.devBotToken);

  client.poru.on('nodeConnect', (node) => {
    logger.info(`${node.name} connected to lavalink server successfully.`);
  });

  client.poru.on('playerUpdate', (player: ExtPlayer) => {
    playerUpdate(player);
  });

  // Poru errors
  client.poru.on('nodeError', (node, event) => {
    logger.error(`Node ${node.name} encountered a error: ${event}`);
  });

  client.poru.on('trackError', (player, _, data) => {
    logger.error(`Error while playing track at player (${player.guildId}): ${data}`);
  });

  client.poru.on(
    'trackStart',
    async (player: ExtPlayer, track) => await trackStart(player, track, client)
  );

  client.poru.on('queueEnd', async (player: ExtPlayer) => queueEnd(player));

  client.poru.on('trackEnd', (player: ExtPlayer) => (player.pauseEditing = true));
}

main();
