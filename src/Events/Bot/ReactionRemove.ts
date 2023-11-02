import { Events } from "discord.js";
import { logger } from "../../Helpers/Logger";
import Starboard from "../../Helpers/StarboardHelpers";
import Event from "../../types/Event";

const ReactionRemove: Event = {
  name: Events.MessageReactionRemove,
  once: false,
  execute: async (reaction, user) => {
    try {
      await new Starboard(reaction, user).main();
    } catch (error) {
      logger.error(error);
    }
  },
};

export default ReactionRemove;
