import { Track } from "poru";
import { client } from "../..";
import { queueHistory } from "../../Helpers/DatabaseSchema";
import { ExtPlayer } from "../../Helpers/ExtendedClient";
import { logger } from "../../Helpers/Logger";
import PlayerEmbedManager from "../../functions/playerEmbedManager";
import Event from "../../types/Event";
import timeoutPlayer from "../../functions/timeoutPlayer";

const TrackStart: Event = {
  name: "trackStart",
  once: false,
  execute: async (player: ExtPlayer, track: Track) => {
    const guild = await client.guilds.fetch(player.guildId);
    const channel = await guild.channels?.fetch(player.textChannel);

    if (player.timeout) {
      timeoutPlayer.cancel(player);
    }

    if (!channel?.isTextBased()) return;

    const oldData = await queueHistory.findOne({
      where: { UUID: player.UUID },
    });

    const currentEntries = await oldData?.getDataValue("entries") ?? "";
    const { info } = track

    const addData = {
      title: info.title,
      author: info.author,
      uri: info.uri,
      image: info.image,
      sourceName: info.sourceName,
      identifier: info.identifier,
      length: info.length,
      requester: info.requester.user.id,
    };

    const newEntries = `${currentEntries}${JSON.stringify(addData)}/split/`;

    if (oldData) {
      await oldData.update({ entries: newEntries });
    } else if (!oldData) {
      await queueHistory.create({ UUID: player.UUID, entries: newEntries });
    }

    const builder = new PlayerEmbedManager(player);
    const row = builder.constructRow();
    const embed = await builder.constructSongStateEmbed();

    if (!embed) return;

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
      const exists = (await channel.messages.fetch({ limit: 1 })).at(0);

      // Message is not first
      if (
        exists?.author.id !== client.user?.id &&
        !exists?.embeds.length &&
        !exists?.embeds.at(0)?.footer?.text.startsWith("Requested by")
      ) {
        player.message.delete().catch(() => { });

        player.message = await channel.send(options);
      }
    }

    try {
      if (player.message) {
        await player.message.edit(options);
      }
    } catch (error) {
      logger.error(`Error while editing song state message: ${error}`);
    }

    player.pauseEditing = false;
  },
};

export default TrackStart;
