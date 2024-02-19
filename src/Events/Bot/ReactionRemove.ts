import { Events, type MessageReaction } from 'discord.js'
import { logger } from '../../config'
import Mutex from '../../Helpers/Mutex'
import Starboard from '../../Helpers/StarboardHelpers'
import type Event from '../../types/Event'

const mutex = new Mutex()

const ReactionRemove: Event = {
  name: Events.MessageReactionRemove,
  once: false,
  execute: async (reaction: MessageReaction) => {
    await mutex.lock()

    try {
      await new Starboard(reaction).main()
    } catch (error) {
      logger.error(error)
    } finally {
      mutex.unlock()
    }
  }
}

export default ReactionRemove
