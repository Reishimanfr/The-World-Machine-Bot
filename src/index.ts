require('dotenv').config();
import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { InteractionCreate } from './Interfaces/Interaction';
import { onMessage } from './Interfaces/Message';
import { Ready } from './Interfaces/Ready';
import { starboardLogic } from './Interfaces/Reaction';
import sequelize from './Interfaces/Models';
import { logger } from './Misc/logger';
import fs from 'fs';

export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Reaction, Partials.Message, Partials.Channel],
});

async function main() {
    await createIfNotExists();

    if (!process.env.BOT_TOKEN) {
        logger.error('You haven\'t provided a bot token in the .env file!');
        process.exit();
    }

    if (!process.env.TENOR_KEY) {
        logger.warn('You haven\'t provided a tenor API key. Some features may not work properly.');
    }

    try {
        await sequelize.sync();
        logger.info('Database synchronized successfully.');
    } catch (error) {
        logger.error(`Error synchronizing database: ${error.stack}`);
    }

    // Main events
    client.once(Events.ClientReady, async () => await Ready(client));
    client.on(Events.InteractionCreate, async (interaction) => { await InteractionCreate(interaction, client); });
    client.on(Events.MessageCreate, async (message) => onMessage(message));

    // Starboard stuff
    client.on(Events.MessageReactionAdd, (i, user) => starboardLogic(i, user, client));
    client.on(Events.MessageReactionRemove, (i, user) => starboardLogic(i, user, client));

    client.login(process.env.BOT_TOKEN);
}

async function createIfNotExists() {
    if (!fs.existsSync('.env')) {
        fs.writeFileSync('.env', 'BOT_TOKEN=\nTENOR_KEY=\nDEV=\nSTEAM_API_KEY=');
        logger.warn('A .env file has been created in the root folder. Please fill it with required tokens.');
        process.exit();
    }
}

main();