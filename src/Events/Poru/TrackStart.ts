import { client } from "../..";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import PlayerEmbedManager from "../../functions/MusicEmbedManager";
import Event from "../../types/Event";
import timeoutPlayer from "../../functions/TimeoutPlayer";

const TrackStart: Event = {
  name: "trackStart",
  once: false,
  execute: async (player: ExtPlayer) => {
    if (player.timeout) {
      timeoutPlayer.cancel(player);
    }

    const guild = await client.guilds.fetch(player.guildId);
    const channel = await guild.channels?.fetch(player.textChannel);

    if (!channel?.isTextBased()) return;

    const builder = new PlayerEmbedManager(player);
    const row = builder.constructRow();
    const embed = await builder.constructSongStateEmbed();

    const options = {
      embeds: [embed],
      components: [row],
    };

    // Send initial message
    if (!player.message) {
      player.message = await channel.send(options);
      return;
    }

    if (player.settings?.resendEmbedAfterSongEnd) {
      const messages = await channel.messages.fetch({ limit: 1 })
      const firstMessage = messages.at(0)

      if (!firstMessage ||
        firstMessage.author.id !== client.user!.id ||
        !firstMessage.embeds.length ||
        !firstMessage.embeds.at(0)?.footer?.text.startsWith('Requested by')
      ) {
        player.message.delete()
          .catch(() => { })

        player.message = await channel.send(options)
      }
    }

    if (player.message) {
      await player.message.edit(options)
        .catch(() => { })
    }

    player.pauseEditing = false;
  },
};

export default TrackStart;
