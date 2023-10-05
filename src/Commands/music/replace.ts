import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtClient, ExtPlayer } from '../../misc/twmClient';
import PlayerEmbedManager from '../../functions/playerEmbedManager';
import util from '../../misc/Util';

export async function replace(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer,
  builder: PlayerEmbedManager,
  client: ExtClient,
) {
  const urlOrSearch = interaction.options.getString('url-or-search', true);
  const pos = interaction.options.getNumber('position', true);

  if (!player.queue[pos - 1]) {
    interaction.reply({
      embeds: [new EmbedBuilder().setDescription(`[ No track at position \`${pos}\`. ]`).setColor(util.twmPurpleHex)],
      ephemeral: true,
    });
    return;
  }

  const res = await client.poru.resolve({
    query: urlOrSearch,
    source: 'ytsearch',
    requester: interaction.member,
  });

  if (res.loadType == 'LOAD_FAILED') {
    const loadFailed = new EmbedBuilder().setDescription(`[ Failed to load track. ]`).setColor(util.twmPurpleHex);

    await interaction.reply({ embeds: [loadFailed], ephemeral: true });
    return;
  } else if (res.loadType == 'NO_MATCHES') {
    const nothingFound = new EmbedBuilder()
      .setDescription(`[ No matches for **${urlOrSearch}** ]`)
      .setColor(util.twmPurpleHex);

    await interaction.reply({ embeds: [nothingFound], ephemeral: true });
    return;
  }

  util.addToAuditLog(player, interaction.user, `Replaced a track at position ${pos}`);

  if (res.loadType == 'PLAYLIST_LOADED') {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[ A playlist consisting of **${res.tracks.length} tracks** was detected. The first one will be loaded because you cannot replace a single song with a playlist. ]`,
          )
          .setColor(util.twmPurpleHex),
      ],
      ephemeral: true,
    });

    const track = res.tracks[0];
    track.info.requester = interaction.member;

    player.queue[pos - 1] = track;
  } else {
    const track = res.tracks[0];
    track.info.requester = interaction.member;

    player.queue[pos - 1] = track;

    const tracksAddedPlaylist = new EmbedBuilder()
      .setDescription(`[ Track at queue position \`${pos}\` replaced. ]`)
      .setColor(util.twmPurpleHex);

    await interaction.reply({ embeds: [tracksAddedPlaylist], ephemeral: true });
  }

  if (!player?.message) return;

  player?.message.edit({
    embeds: [await builder.constructSongStateEmbed()],
  });
}
