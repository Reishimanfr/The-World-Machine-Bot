import { ActivityType, Events } from 'discord.js';
import { logger } from '../../Helpers/Logger';

const Ready = {
  name: Events.ClientReady,
  once: true,
  execute: async (client) => {
    client.poru.init(client);
    logger.info(`${client.user?.username} is online.`);
  
    setInterval(function () {
      const activityString =
        client.poru.players.size > 0
          ? `music in ${
              client.poru.players.size == 1 ? `one server` : `${client.poru.players.size} servers!`
            } 🎵`
          : `Oneshot 💡`;
  
      client.user?.setPresence({
        activities: [
          {
            name: activityString,
            type: ActivityType.Playing,
          },
        ],
      });
    }, 60000);
  }
}

export default Ready;
