import { Events } from "discord.js";
import { logger } from "../../Helpers/Logger";
import Starboard from "../../Helpers/StarboardHelpers";
import Event from "../../types/Event";

const ReactionAdd: Event = {
  name: Events.MessageReactionAdd,
  once: false,
  execute: async (reaction, user) => {
    try {
      await new Starboard(reaction, user).main();
    } catch (error) {
      logger.error(`Failed to send starboard message: ${error.message}`)
    }
  },
};

export default ReactionAdd;
