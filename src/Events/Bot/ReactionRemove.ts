import { Events } from "discord.js";
import { logger } from "../../Helpers/Logger";
import Starboard from "../../Helpers/StarboardHelper";

const ReactionRemove = {
  name: Events.MessageReactionRemove,
  once: false,
  execute: async (reaction, user) => {
    try {
      await new Starboard(reaction, user).main();
    } catch (error) {
      logger.error(error.stack);
    }
  }
}

export default ReactionRemove