import { ExtPlayer, MessageManager } from '../../Helpers/ExtendedPlayer'
import { logger } from '../../config'
import { inactiveGifUrl } from '../../Helpers/Util'
import { Event } from '../../Types/Event'

const PlayerDestroy: Event = {
  name: 'playerDestroy',
  once: false,
  execute: async (player: ExtPlayer, reason?: string) => {
    const message = await player.message?.fetch()
      .catch(() => null)

    const builder = new MessageManager(player)

    if (reason) {
      player.disconnect()
      void player.node.rest.destroyPlayer(player.guildId)
      player.poru.players.delete(player.guildId)
    }

    if (!message) return

    const embed = await builder.createPlayerEmbed()[0]
    const buttons = builder.createPlayerButtons(true)

    if (reason) {
      embed.setAuthor({
        name: `${reason}`,
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
