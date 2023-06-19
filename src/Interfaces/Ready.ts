import { Client, ActivityType, PresenceUpdateStatus } from 'discord.js';
import { logger } from '../Misc/logger';

export const Ready = async (client: Client) => {

    // Feel free to change this to anything you want lol
    client.user.setPresence({
        activities: [{ name: 'You', type: ActivityType.Watching }],
        status: PresenceUpdateStatus.Online,
    });

    logger.info(`Logged in as: ${client.user.tag} (id: ${client.user.id})`);
    logger.info(`Currently in: ${client.guilds.cache.size} guilds`);
};