import { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'
import { inactiveGifUrl } from '../../Helpers/Util'
import { Event } from '../../Types/Event'

const PlayerDestroy: Event = {
  name: 'playerDestroy',
  once: false,
  execute: async (player: ExtPlayer) => {
    const message = await player.message?.fetch()
      .catch(() => null)


    if (!message) return

    const embed = await player.messageManger.createPlayerEmbed()
    const buttons = player.messageManger.createPlayerButtons(true)

    embed.at(0)!.setAuthor({
      name: 'Session ended.',
      iconURL: inactiveGifUrl
    })

    try {
      await message.edit({
        embeds: [embed.at(0)!],
        components: [buttons]
      })
    } catch (error) {
      logger.error(`A error occurred while editing message after player destroy event: ${error.stack}`)
    }
  }
}

export default PlayerDestroy
