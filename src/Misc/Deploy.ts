require('dotenv').config();
import { Client, GatewayIntentBits, Partials, REST, Routes, TextChannel } from 'discord.js';
import { CommandList } from '../Commands/!!CommandsExport';
import { logger } from './logger';

async function main() {
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
        partials: [Partials.Reaction, Partials.Message, Partials.Channel],
    });
    await client.login(process.env.BOT_TOKEN);

    // Deploy slash commands
    const commandsJSON = CommandList.map(com => com.data.toJSON());

    logger.info('Registering (/) commands...');

    await new REST()
        .setToken(process.env.BOT_TOKEN)
        .put(Routes.applicationCommands(client.user.id), { body: commandsJSON })
        .then(_ => logger.info('Success!'))
        .catch(error => logger.error(error.stack));

    const guild = await client.guilds.fetch('646509151119474701');
    const channel = await guild.channels.fetch('865990162357944330') as TextChannel;

    await channel.send({
        embeds: [{
            description: '[Deploy.ts - pretest]: Multiple changes to script at `Commands/tf2.ts`\nCommand updated with new agruments (took 3144ms).\nCommand ready',
        }],
    });

    process.exit();
}

main();