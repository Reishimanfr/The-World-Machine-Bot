import constructProgressBar from '../../Funcs/ProgressBarConstructor'
import { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'
import { inactiveGifUrl } from '../../Helpers/Util'
import { Event } from '../../Types/Event'

const QueueEnd: Event = {
  name: 'queueEnd',
  once: false,
  execute: async (player: ExtPlayer) => {
    // Set the player timeout
    player.controller.setupPlayerTimeout()

    const embed = await player.messageManger.createPlayerEmbed()
    const buttons = player.messageManger.createPlayerButtons(true)
    const descriptionSplit = embed.at(0)?.data.description?.split('\n')

    if (player.settings.queueEndDisconnect) return player.destroy()

    const message = await player.message?.fetch()
      .catch(() => null)

    if (!message) return

    embed.at(0)?.setDescription(`${descriptionSplit?.[0] ?? ''}\n\n${constructProgressBar(1, 1, player)}\nSong ended.`)
    embed.at(0)?.setAuthor({
      name: 'Waiting for another song...',
      iconURL: inactiveGifUrl
    })

    player.pauseEditing = true

    try {
      await message.edit({
        embeds: [embed.at(0)!],
        components: [buttons]
      })
    } catch (error) {
      logger.error(`Failed to update message on queue end: ${error}`)
    }
  }
}

export default QueueEnd
