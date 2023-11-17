import { EmbedBuilder } from "discord.js";
import { botStats } from "../../Helpers/DatabaseSchema";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import Event from "../../types/Event";
import PlayerEmbedManager from "../../functions/MusicEmbedManager";
import { logger } from "../../Helpers/Logger";
import util from "../../Helpers/Util";

const PlayerDestroy: Event = {
  name: 'playerDestroy',
  once: false,
  execute: async (player: ExtPlayer, reason?: string) => {
    const record = await botStats.findOne({ where: { guildId: player.guildId } })
    const currentVcTime = record?.getDataValue('vcTime') ?? 0
    const currentSessions = record?.getDataValue('sessionCount') ?? 0

    await botStats.update({
      vcTime: currentVcTime + player.timeInVc,
      sessionCount: currentSessions + 1
    }, { where: { guildId: player.guildId } })

    const message = player?.message
    const builder = new PlayerEmbedManager(player)

    if (reason) {
      player.disconnect()
      player.node.rest.destroyPlayer(player.guildId)
      player.poru.players.delete(player.guildId)
    }

    if (!message) return

    const IDEmbed = new EmbedBuilder()
      .setDescription(`Session ID: ${player.sessionId ?? "⚠️ missing ID!"}`)

    const embed = EmbedBuilder.from(message!.embeds[0])

    embed.setAuthor({
      name: 'Stopped: ' + reason || 'no reason provided',
      iconURL: util.playerGifUrl
    })

    try {
      message?.edit({
        embeds: [embed, IDEmbed],
        components: [builder.constructRow(true)]
      })
    } catch (error) {
      logger.error(`A error occurred while editing message after player destroy event: ${error.stack}`)
    }

  }
}

export default PlayerDestroy