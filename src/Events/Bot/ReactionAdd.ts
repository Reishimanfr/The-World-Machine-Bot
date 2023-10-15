import { Events } from "discord.js";
import { logger } from "../../Helpers/Logger";
import Starboard from "../../Helpers/StarboardHelper";

const ReactionAdd = {
  name: Events.MessageReactionAdd,
  once: false,
  execute: async (reaction, user) => {
    try {
      await new Starboard(reaction, user).main();
    } catch (error) {
      logger.error(error.stack);
    }
  }
}

export default ReactionAdd