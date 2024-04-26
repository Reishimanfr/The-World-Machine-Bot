import { setTimeout } from 'node:timers/promises'
import type { ExtPlayer } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'
import { inactiveGifUrl } from '../../Helpers/Util'
import type { Event } from '../../Types/Event'
import type { EmbedBuilder } from 'discord.js'

const PlayerDestroy: Event = {
  name: 'playerDestroy',
  once: false,
  execute: async (player: ExtPlayer) => {
    const message = await player.message?.fetch()
      .catch(() => null)

    if (!message) return

    const embed: EmbedBuilder = (await player.messageManger.createPlayerEmbed(true))[0]
    const buttons = player.messageManger.createPlayerButtons(true)

    const descriptionSplit = embed.data.description?.split('\n')

    embed.setDescription(`${descriptionSplit?.[0] ?? ''}`)
    embed.setAuthor({
      name: 'Goodbye...⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      iconURL: inactiveGifUrl
    })

    try {
      // Because for some fucking reason lavalink fires this event alongside some other random event like queueEnd
      await setTimeout(1000) 
      await message.edit({
        embeds: [embed],
        components: [buttons]
      })
    } catch (error) {
      logger.error(`A error occurred while editing message after player destroy event: ${error.stack}`)
    }
  }
}

export default PlayerDestroy
