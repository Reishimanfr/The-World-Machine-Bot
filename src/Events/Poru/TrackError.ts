import { EmbedBuilder } from "discord.js";
import { Track } from "poru";
import { ExtPlayer } from "../../Helpers/ExtendedClient";
import { logger } from "../../Helpers/Logger";
import Event from "../../types/Event";

const TrackError: Event = {
  name: "trackError",
  once: false,
  execute: async (player: ExtPlayer, track: Track, error) => {
    logger.error(`Error while playing track: ${error}`);

    const message = await player?.message?.fetch();

    if (!message) return;

    const statusEmbed = EmbedBuilder.from(message.embeds[0]);

    const errorEmbed = new EmbedBuilder()
      .setDescription(
        `[ ⚠️ A error occurred while trying to play track **${track.info.title}**. ]`
      )
      .setColor("DarkRed");

    try {
      await message.edit({
        embeds: [statusEmbed, errorEmbed],
      });
    } catch (e) {
      logger.error(
        `Failed to append error embed on TrackError event: ${e.stack}`
      );
    }
  },
};

export default TrackError;
