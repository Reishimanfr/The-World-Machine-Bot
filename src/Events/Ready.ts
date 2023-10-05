import { ActivityType } from 'discord.js';
import { logger } from '../misc/logger';
import { client } from '..';

const Ready = async () => {
  client.user?.setPresence({
    activities: [
      {
        name: `Oneshot 💡`,
        type: ActivityType.Playing,
      },
    ],
  });

  client.poru.init(client);
  logger.info(`${client.user?.username} is online.`);
};

export default Ready;
