import { ActivityType, Events } from 'discord.js'
import { type ExtClient } from '../../Helpers/ExtendedClasses'
import { logger } from '../../Helpers/Logger'
import type Event from '../../types/Event'

const Ready: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: ExtClient) => {
    client.poru.init(client)
    logger.info(`${client.user?.username} is online.`)

    client.user?.setPresence({
      activities: [
        {
          name: `music in ${client.guilds.cache.size} servers 🎶`,
          type: ActivityType.Streaming
        }
      ]
    })
  }
}

export default Ready
