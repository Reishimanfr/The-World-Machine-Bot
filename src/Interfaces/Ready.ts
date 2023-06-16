import { Client, ActivityType, PresenceUpdateStatus } from "discord.js"
import { logger } from "../Tools/logger"

export const Ready = async (client: Client) => {

    client.user.setPresence({
        activities: [{ name: 'Currently in Dev mode!', type: ActivityType.Playing }],
        status: PresenceUpdateStatus.DoNotDisturb
    })

    logger.info(`Logged in as: ${client.user.tag} (id: ${client.user.id})`)
    logger.info(`Currently in: ${client.guilds.cache.size} guilds`)
}