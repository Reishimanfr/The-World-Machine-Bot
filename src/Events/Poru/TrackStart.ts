import { client } from '../..'
import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import { MessageManager } from '../../Helpers/MessageManager'
import { PlayerController } from '../../Helpers/PlayerController'
import type Event from '../../types/Event'

const TrackStart: Event = {
  name: 'trackStart',
  once: false,
  execute: async (player: ExtPlayer) => {
    const controller = new PlayerController(player)
    const builder = new MessageManager(player)

    if (player.timeout) {
      void controller.cancelPlayerTimeout()
    }

    const guild = await client.guilds.fetch(player.guildId)
    const channel = await guild.channels?.fetch(player.textChannel)

    if (!channel?.isTextBased() || !client.user) return

    const permission = channel.permissionsFor(client.user.id)

    if (!permission?.has('SendMessages')) return

    const buttons = builder.createPlayerButtons(false, { save: false })
    const embed = await builder.createPlayerEmbed()

    const options = {
      embeds: [embed],
      components: [buttons]
    }

    // Send initial message
    if (!player.message) {
      player.message = await channel.send(options)
      return
    }

    if (player.settings?.resendMessageOnEnd) {
      const messages = await channel.messages.fetch({ limit: 1 })
      const firstMessage = messages.at(0)

      if (!firstMessage ||
        firstMessage.author.id !== client.user.id ||
        !firstMessage.embeds.length ||
        !firstMessage.embeds.at(0)?.footer?.text.startsWith('Requested by')
      ) {
        const message = await player.message.fetch()
          .catch(() => null)

        if (message?.deletable) {
          await message.delete()
        }

        player.message = await channel.send(options)
      }
    }

    if (player.message) {
      const message = await player.message.fetch()
        .catch(() => null)

      if (message) {
        await message.edit(options)
      }
    }

    player.pauseEditing = false
  }
}

export default TrackStart
