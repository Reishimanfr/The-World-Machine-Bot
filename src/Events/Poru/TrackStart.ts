import { type Category, type Segment, SponsorBlock } from 'sponsorblock-api'
import { client } from '../..'
import type { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'
import type { Event } from '../../Types/Event'
import { SponsorBlockDb } from '../../Models'

const TrackStart: Event = {
  name: 'trackStart',
  once: false,
  execute: async (player: ExtPlayer) => {
    if (player.timeout) player.controller.cancelPlayerTimeout()

    if (player.currentTrack.info.sourceName === 'youtube') {
      const [record] = await SponsorBlockDb.findOrCreate({
        where: { guildId: player.guildId }
      })

      const sponsorBlockConfig = record.dataValues
      const segments: Array<string> = []

      for (const [key, value] of Object.entries(sponsorBlockConfig)) {
        const bool = (value === '0' || value === '1') ? Boolean(Number.parseInt(value)) : Boolean(value)
        if (bool && !['id', 'guildId', 'createdAt', 'updatedAt'].includes(key)) segments.push(key)
      }

      player.sponsorSegments = segments.length ? await new SponsorBlock('twm')
        .getSegments(player.currentTrack.info.identifier, segments as Category[])
        .catch(() => {
          return [] as Segment[]
        })
        : []
    }

    const guild = await client.guilds.fetch(player.guildId)
    const channel = await guild.channels?.fetch(player.textChannel)

    if (!channel?.isTextBased() || !client.user || !channel.permissionsFor(client.user.id)?.has('SendMessages')) return

    const buttons = player.messageManger.createPlayerButtons(false, { save: false })
    const embed = await player.messageManger.createPlayerEmbed()

    const options = {
      embeds: [...embed],
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
        const message = await player.message.fetch().catch(() => null)

        if (message?.deletable) {
          await message.delete()
        }

        player.message = await channel.send(options)
        return
      }
    }

    if (player.message) {
      const message = await player.message.fetch().catch(() => null)

      if (message) await message.edit(options)
    }

    player.pauseEditing = false
  }
}

export default TrackStart
