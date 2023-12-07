import { Events } from "discord.js";
import { log } from "../../Helpers/Logger";
import Mutex from "../../Helpers/Mutex";
import Starboard from "../../Helpers/StarboardHelpers";
import Event from "../../types/Event";

const mutex = new Mutex()

const ReactionRemove: Event = {
  name: Events.MessageReactionRemove,
  once: false,
  execute: async (reaction) => {
    await mutex.lock()

    try {
      await new Starboard(reaction).main();
    } catch (error) {
      log.error(error);
    } finally {
      mutex.unlock()
    }
  },
};

export default ReactionRemove;
