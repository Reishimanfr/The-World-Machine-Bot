import { setTimeout } from 'timers/promises'
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

    const embed = await player.messageManger.createPlayerEmbed(true)
    const buttons = player.messageManger.createPlayerButtons(true)

    const descriptionSplit = embed.at(0)?.data.description?.split('\n')
    embed.at(0)?.setDescription(`${descriptionSplit?.[0] ?? ''}`)
    embed.at(0)?.setAuthor({
      name: 'Goodbye...⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      iconURL: inactiveGifUrl
    })

    try {
      await setTimeout(1000)
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
