import Starboard from './EventHelpers/StarboardHelper';
import { logger } from '../misc/logger';

const MessageReactionAdd = async (reaction, user, client) => {
  try {
    await new Starboard(reaction, user, client).main();
  } catch (error) {
    logger.error(error.stack);
  }
};

const MessageReactionRemove = async (reaction, user, client) => {
  try {
    await new Starboard(reaction, user, client).main();
  } catch (error) {
    logger.error(error.stack);
  }
};

export { MessageReactionAdd, MessageReactionRemove };
