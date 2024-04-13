import { Events, MessageReaction } from 'discord.js'
import Mutex from '../../Helpers/Mutex'
import { logger } from '../../Helpers/Logger'
import { Starboard } from '../../Classes/Starboard'
import { Event } from '../../Types/Event'

const mutex = new Mutex()

const ReactionAdd: Event = {
  name: Events.MessageReactionAdd,
  once: false,
  execute: async (reaction: MessageReaction) => {
    await mutex.lock()

    try {
      await new Starboard(reaction).main()
    } catch (error) {
      logger.error(`Failed to send starboard message: ${error.message}`)
    } finally {
      mutex.unlock()
    }
  }
}

export default ReactionAdd
