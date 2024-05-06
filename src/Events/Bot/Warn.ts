import { Events } from 'discord.js'
import type { Event } from '../../Types/Event';
import { logger } from '../../Helpers/Logger'

const Warn: Event = {
  name: Events.Warn,
  once: false,

  execute: (info: string) => {
    logger.warn(`Discord.js warning: ${info}`)
  }
}

export default Warn