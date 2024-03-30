import { Events, MessageReaction } from 'discord.js'
import { logger } from '../../Helpers/Logger'
import Mutex from '../../Helpers/Mutex'
import { StarboardHelper } from '../../Classes/StarboardHelper'
import { Event } from '../../Types/Event'
import { serverStats } from '../../Models'

const mutex = new Mutex()

const ReactionRemove: Event = {
  name: Events.MessageReactionRemove,
  once: false,
  execute: async (reaction: MessageReaction) => {
    await mutex.lock()

    try {
      await new StarboardHelper(reaction).main()
    } catch (error) {
      logger.error(error)
    } finally {
      const [record] = await serverStats.findOrCreate({
        where: { guildId: reaction.message.guildId },
        defaults: { guildId: reaction.message.guildId, lastActive: new Date() }
      })
  
      record.update({ lastActive: new Date()})
      mutex.unlock()
    }
  }
}

export default ReactionRemove
