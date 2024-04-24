import { type ExtPlayer, MessageManager } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'
import type { Event } from '../../Types/Event'

const PlayerUpdate: Event = {
  name: 'playerUpdate',
  once: false,
  execute: async (player: ExtPlayer) => {
    if (!player.settings.dynamicNowPlaying) return
    if (!player.isPlaying) return
    if (player.pauseEditing) return
    if (player.isPaused) return

    if (player.sponsorSegments?.length) {
      logger.debug(player.sponsorSegments)

      const nextSeg = player.sponsorSegments[0]
      const segStart = (nextSeg?.startTime ?? 0) * 1000
      const segEnd = (nextSeg?.endTime ?? 0) * 1000

      if (nextSeg && player.position >= segStart) {
        const timeToSkip = player.position - segEnd

        setTimeout(() => {
          player.seekTo(Math.trunc(segEnd))
        }, timeToSkip)
      }

      player.sponsorSegments.shift()
    }

    const message = await player.message?.fetch()
      .catch(() => null)

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

export default PlayerUpdate
