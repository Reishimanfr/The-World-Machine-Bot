import { Events } from "discord.js";
import { logger } from "../../Helpers/Logger";
import Starboard from "../../Helpers/StarboardHelpers";
import Event from "../../types/Event";

const ReactionAdd: Event = {
  name: Events.MessageReactionAdd,
  once: false,
  execute: async (reaction, user) => {
    await new Starboard(reaction, user).main();

  },
};

export default ReactionAdd;
