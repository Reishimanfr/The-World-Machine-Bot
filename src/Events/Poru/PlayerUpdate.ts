import { ExtPlayer, MessageManager } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../config'
import { Event } from '../../Types/Event'

// Updates the player song state embed stuff
const PlayerUpdate: Event = {
  name: 'playerUpdate',
  once: false,
  execute: async (player: ExtPlayer) => {
    if (!player.settings?.dynamicNowPlaying) return
    if (player.pauseEditing) return
    if (!player.isPlaying) return
    if (player.isPaused) return

    if (isNaN(player.lavalinkUpdateTics)) player.lavalinkUpdateTics = 0
    player.lavalinkUpdateTics = player.lavalinkUpdateTics + 1

    if (player.currentSponsoredSegments?.length) {
      const nextSegment = player.currentSponsoredSegments?.at(0)
      
      if (nextSegment && player.position >= nextSegment.startTime * 1000) {
        player.seekTo(Math.trunc(nextSegment.endTime * 1000))

        player.currentSponsoredSegments = player.currentSponsoredSegments.slice(1)
      }
    }

    if (player.lavalinkUpdateTics >= 15) {
      const message = await player.message?.fetch()
        .catch(() => null)

      player.lavalinkUpdateTics = 0

      if (!message) return

      const builder = new MessageManager(player)
      const embeds = await builder.createPlayerEmbed()
      const row = builder.createPlayerButtons()

      try {
        await message.edit({
          embeds: [...embeds],
          components: [row]
        })
      } catch (error) {
        logger.error(`Failed to update player song state embed in guild ${player.message?.guildId}: ${error}`)
      }
    }
  }
}

export default PlayerUpdate
