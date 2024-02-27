import { Category, Segment, SponsorBlock } from 'sponsorblock-api'
import { client  } from '../..'
import { ExtPlayer } from '../../Helpers/ExtendedClasses'
import { MessageManager } from '../../Helpers/MessageManager'
import { PlayerController } from '../../Helpers/PlayerController'
import { logger } from '../../config'
import Event from '../../types/Event'
import { SponsorBlockDb } from '../../Models'

const TrackStart: Event = {
  name: 'trackStart',
  once: false,
  execute: async (player: ExtPlayer) => {
    const controller = new PlayerController(player)
    const builder = new MessageManager(player)

    if (player.timeout) {
      logger.debug(`Canceling active player timeout`)
      void controller.cancelPlayerTimeout()
    }

    const [record] = await SponsorBlockDb.findOrCreate({
      where: {
        guildId: player.guildId
      }
    })

    const sponsorBlockConfig = record.dataValues
    const segments: Array<string> = []

    for (const [key, value] of Object.entries(sponsorBlockConfig)) {
      const bool = (value === '0' || value === '1') ? Boolean(parseInt(value)) : Boolean(value) 
      if (bool && !['id', 'guildId', 'createdAt', 'updatedAt'].includes(key)) segments.push(key)
    }

    player.currentSponsoredSegments = segments.length ? await new SponsorBlock(player.sessionId)
      .getSegments(player.currentTrack.info.identifier, segments as Category[])
      .catch(_ => {
        return [] as Segment[]
      })
      : []

    const guild = await client.guilds.fetch(player.guildId)
    const channel = await guild.channels?.fetch(player.textChannel)

    if (!channel?.isTextBased() || !client.user || !channel.permissionsFor(client.user.id)?.has('SendMessages')) return

    const buttons = builder.createPlayerButtons(false, { save: false })
    const embed = await builder.createPlayerEmbed()

    const options = {
      embeds: [...embed],
      components: [buttons]
    }

    // Send initial message
    if (!player.message) {
      logger.debug(`Creating initial player status message`)
      player.message = await channel.send(options)
      return
    }

    logger.trace(`Initial player message was created already. Looking for other things to do.`)

    if (player.settings?.resendMessageOnEnd) {
      logger.trace(`Resend message on track end is enabled. Checking if we have to resend the message.`)
      const messages = await channel.messages.fetch({ limit: 1 })
      const firstMessage = messages.at(0)

      if (!firstMessage ||
        firstMessage.author.id !== client .user.id ||
        !firstMessage.embeds.length ||
        !firstMessage.embeds.at(0)?.footer?.text.startsWith('Requested by')
      ) {
        logger.trace(`Resending the now playing message since it's not the first message in the channel.`)
        const message = await player.message.fetch()
          .catch(() => null)

        if (message?.deletable) {
          logger.trace(`Attempting to delete the old message`)
          await message.delete()
        }

        logger.trace(`Assigning the new message to the player class`)
        player.message = await channel.send(options)
        return
      }
    }

    if (player.message) {
      logger.trace(`Attempting to edit the existing message`)
      const message = await player.message.fetch()
        .catch(() => null)

      if (message) {
        logger.trace(`The message exists, editing it with up-to-date info now`)
        await message.edit(options)
      }
    }

    player.pauseEditing = false
  }
}

export default TrackStart
