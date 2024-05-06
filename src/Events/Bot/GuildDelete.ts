// Delete everything related to the guild from which we got kicked out of
import { Events, type Guild } from 'discord.js'
import type { Event } from '../../Types/Event';
import { PlayerSettings, SponsorBlockDb, serverStats, starboardConfig, starboardEntries } from '../../Models'
import { logger } from '../../Helpers/Logger'

const GuildDelete: Event = {
  name: Events.GuildDelete,
  once: false,

  execute: async (guild: Guild) => {
    logger.warn(`Deleting database entries for guild "${guild.name}" (${guild.id})`)

    const classes = [PlayerSettings, serverStats, SponsorBlockDb, starboardConfig, starboardEntries]

    for (const part of classes) {
      try {
        await part.destroy({ where: { guildId: guild.id } })
      } catch (error) {
        logger.error(`Failed to delete database entry after leaving server ${guild.name} (${guild.id}): ${error.stack}`)
      }
    }
  }
}

export default GuildDelete