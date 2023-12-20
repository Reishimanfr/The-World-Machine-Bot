import { EmbedBuilder } from "discord.js";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import { log } from "../../Helpers/Logger";
import { MessageManager } from "../../Helpers/MessageManager";
import { inactiveGifUrl } from "../../Helpers/Util";
import { botStats } from "../../Models";
import Event from "../../types/Event";

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
      player.node.rest.destroyPlayer(player.guildId)
      player.poru.players.delete(player.guildId)
    }

    if (!message) return

    const IDEmbed = new EmbedBuilder()
      .setDescription(`Session ID: ${player.sessionId ?? "⚠️ missing ID!"}`)
      .setColor('#2b2d31')

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
        embeds: [embed, IDEmbed],
        components: [buttons]
      })
    } catch (error) {
      log.error(`A error occurred while editing message after player destroy event: ${error.stack}`)
    }
  }
}

export default PlayerDestroy