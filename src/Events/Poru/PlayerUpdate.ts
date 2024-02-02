import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import { logger } from '../../Helpers/Logger'
import { MessageManager } from '../../Helpers/MessageManager'
import type Event from '../../types/Event'

// Updates the player song state embed stuff
const PlayerUpdate: Event = {
  name: 'playerUpdate',
  once: false,
  execute: async (player: ExtPlayer) => {
    if (!player.settings?.dynamicNowPlaying) return
    if (player.pauseEditing) return
    if (!player.isPlaying) return
    if (player.isPaused) return

    const message = await player.message?.fetch()
      .catch(() => null)

    if (!message) return

    const builder = new MessageManager(player)
    const embed = await builder.createPlayerEmbed()
    const row = builder.createPlayerButtons()

    try {
      await message.edit({
        embeds: [embed],
        components: [row]
      })
    } catch (error) {
      logger.error(`Failed to update player song state embed in guild ${player.message?.guildId}: ${error}`)
    }
  }
}

export default PlayerUpdate
