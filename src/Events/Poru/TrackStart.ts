import { type Category, type Segment, SponsorBlock } from 'sponsorblock-api'
import { client } from '../..'
import type { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'
import type { Event } from '../../Types/Event'
import { SponsorBlockDb } from '../../Models'

// This is used for the differences between sqlite and postgres where sqlite's
// booleans are '1' and '0' strings that can't be converted directly into booleans
// using Boolean('0') as it'll always return true

// biome-ignore lint/suspicious/noExplicitAny: we want any type to match here
function normalizeBooleans(val: any): boolean {
  if (process.env.DATABASE_DIALECT === 'sqlite') {
    return Boolean(Number(val))
  }

  return val === 'true'
}

const TrackStart: Event = {
  name: 'trackStart',
  once: false,
  execute: async (player: ExtPlayer) => {
    player.controller.cancelPlayerTimeout()

    if (player.currentTrack.info.sourceName === 'youtube') {
      const [record] = await SponsorBlockDb.findOrCreate({
        where: { guildId: player.guildId }
      })

      const enabledRules = Object.entries(record.dataValues)
        .filter(([key, value]) => !['id', 'guildId', 'createdAt', 'updatedAt'].includes(key) && normalizeBooleans(value))
        .map(([key]) => key)

      if (enabledRules.length) {
        player.sponsorSegments = await new SponsorBlock('')
          .getSegments(player.currentTrack.info.identifier, enabledRules as Category[])
          .catch(error => {
            logger.error(`Failed to fetch sponsorblock segments: ${error.stack}`)
            return []
          })
      }
    }

    const guild = await client.guilds.fetch(player.guildId)
    const channel = await guild.channels?.fetch(player.textChannel)

    if (!channel?.isTextBased() || !channel.permissionsFor(client.user.id)?.has('SendMessages')) return

    const buttons = player.messageManger.createPlayerButtons(false, { save: false })
    const embeds = await player.messageManger.createPlayerEmbed()

    const options = {
      embeds: [...embeds],
      components: [buttons]
    }

    // Send initial message
    if (player.message === undefined) {
      logger.debug('Creating initial player status message')
      player.message = await channel.send(options)
      return
    }

    if (player.settings?.resendMessageOnEnd) {
      const messages = await channel.messages.fetch({ limit: 1 })
      const firstMessage = messages.at(0)

      if (!firstMessage) return

      if (firstMessage.author.id !== client.user.id ||
        !firstMessage.embeds.length ||
        !firstMessage.embeds.at(0)?.footer?.text.startsWith('Requested by')
      ) {
        const message = await player.message.fetch()
          .catch(() => {})

        message?.delete()
          .catch(() => {})

        player.message = await channel.send(options)
        return
      }
    }

    if (player.message) {
      const message = await player.message.fetch()
        .catch(() => {})

      if (message) await message.edit(options)
    }
  }
}

export default TrackStart
