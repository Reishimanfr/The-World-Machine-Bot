import constructProgressBar from '../../Funcs/ProgressBarConstructor'
import { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../config'
import { inactiveGifUrl } from '../../Helpers/Util'
import { Event } from '../../Types/Event'
import PlayerDestroy from './PlayerDestroy'

const QueueEnd: Event = {
  name: 'queueEnd',
  once: false,
  execute: async (player: ExtPlayer) => {
    // Set the player timeout
    void player.controller.setupPlayerTimeout()

    const embed = await player.messageManger.createPlayerEmbed()[0]
    const buttons = player.messageManger.createPlayerButtons(true)
    const descriptionSplit = embed.data.description?.split('\n')

    if (player.settings.queueEndDisconnect) {
      return PlayerDestroy.execute(player, 'Queue ended.')
    }

    const message = await player.message?.fetch()
      .catch(() => null)

    if (!message) return

    embed.setDescription(`${descriptionSplit?.[0] ?? ''}\n\n${constructProgressBar(1, 1)}\nSong ended.`)
    embed.setAuthor({
      name: 'Waiting for another song...',
      iconURL: inactiveGifUrl
    })

    player.pauseEditing = true

    try {
      await message.edit({
        embeds: [embed],
        components: [buttons]
      })
    } catch (error) {
      logger.error(`Failed to update message on queue end: ${error}`)
    }
  }
}

export default QueueEnd
