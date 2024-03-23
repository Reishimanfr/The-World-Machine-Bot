import { ExtPlayer, MessageManager } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../Helpers/Logger'
import { Event } from '../../Types/Event'

// ======================================================================= //
// ⚠️⚠️⚠️ WARNING ⚠️⚠️⚠️                                                //
// IF YOU'RE HERE THIS PROBABLY MEANS YOU'RE TRYING TO CHANGE SOMETHING    //
// THAT YOU REALLY SHOULDN'T                                               //
//                                                                         //
// DO NOT CHANGE THE LAVALINK UPDATE TICKS THRESHOLD AS THIS WOULD BREAK   //
// BOTH SPONSORBLOCK AND ANTI-API SPAMMING MEASURES                        //
// GO TO YOUR APPLICATION.YML FILE AND SET THE UPDATE RATE TO 15 SECONDS   //
// AND LEAVE THIS CODE ALONE!                                              //
// ======================================================================= //
const PlayerUpdate: Event = {
  name: 'playerUpdate',
  once: false,
  execute: async (player: ExtPlayer) => {
    if (!player.settings.dynamicNowPlaying) return
    if (!player.isPlaying) return
    if (player.pauseEditing) return
    if (player.isPaused) return
    
    if (player.sponsorSegments?.length) {
      const nextSeg = player.sponsorSegments.at(0)
      const segStart = (nextSeg?.startTime ?? 0) * 1000
      const segEnd = (nextSeg?.endTime ?? 0) * 1000

      if (nextSeg && player.position >= segStart) {
        const timeToSkip = player.position - segEnd

        setTimeout(() => {
          player.seekTo(Math.trunc(segEnd))
        }, timeToSkip)
      }

      player.sponsorSegments = player.sponsorSegments.slice(1)
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
