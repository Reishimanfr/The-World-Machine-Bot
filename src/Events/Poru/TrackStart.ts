import { client  } from '../..'
import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import { MessageManager } from '../../Helpers/MessageManager'
import { PlayerController } from '../../Helpers/PlayerController'
import { logger } from '../../config'
import type Event from '../../types/Event'

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

    const guild = await client .guilds.fetch(player.guildId)
    const channel = await guild.channels?.fetch(player.textChannel)

    if (!channel?.isTextBased() || !client .user) return

    const permission = channel.permissionsFor(client .user.id)

    if (!permission?.has('SendMessages')) return

    const buttons = builder.createPlayerButtons(false, { save: false })
    const embed = await builder.createPlayerEmbed()

    const options = {
      embeds: [embed],
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
