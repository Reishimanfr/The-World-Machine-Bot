import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import { logger } from '../../Helpers/Logger'
import { MessageManager } from '../../Helpers/MessageManager'
import { inactiveGifUrl } from '../../Helpers/Util'
import { botStats } from '../../Models'
import type Event from '../../types/Event'

const PlayerDestroy: Event = {
  name: 'playerDestroy',
  once: false,
  execute: async (player: ExtPlayer, reason?: string) => {
    const record = await botStats.findOne({ where: { guildId: player.guildId } })
    const currentVcTime = record?.getDataValue('vcTime') ?? 0
    const currentSessions = record?.getDataValue('sessionCount') ?? 0

    if (!player.timeInVc) {
      player.timeInVc = 0
    }

    await botStats.update({
      vcTime: currentVcTime + player.timeInVc,
      sessionCount: currentSessions + 1
    }, { where: { guildId: player.guildId } })

    const message = await player?.message?.fetch()
      .catch(() => null)

    const builder = new MessageManager(player)

    if (reason) {
      player.disconnect()
      void player.node.rest.destroyPlayer(player.guildId)
      player.poru.players.delete(player.guildId)
    }

    if (!message) return

    const embed = await builder.createPlayerEmbed()
    const buttons = builder.createPlayerButtons(true)

    if (reason) {
      embed.setAuthor({
        name: `Player stop reason: ${reason}`,
        iconURL: inactiveGifUrl
      })
    }

    try {
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
