import {
  ActionRowBuilder,
  AnySelectMenuInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import { ExtClient, ExtPlayer } from '../../../Helpers/ExtendedClient';
import { logger } from '../../../Helpers/Logger';
import util from '../../../Helpers/Util';
import { config } from '../../../config';
import Subcommand from '../../../types/Subcommand';

type interactionType = ChatInputCommandInteraction | AnySelectMenuInteraction | ButtonInteraction;

async function sendEmbed(interaction: interactionType, description: string): Promise<any> {
  const embed = new EmbedBuilder().setDescription(description).setColor(util.embedColor);

  try {
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error while sending play callback: ${error.stack}`);
  }
}

export async function loadTrack(
  interaction: interactionType,
  client: ExtClient,
  player: ExtPlayer,
  query: string,
) {
  const res = await client.poru.resolve({
    query: query,
    source: 'ytsearch',
    requester: interaction.member,
  });

  if (res.loadType == 'LOAD_FAILED') {
    return sendEmbed(interaction, '[ Failed to load track. ]');
  } else if (res.loadType == 'NO_MATCHES') {
    return sendEmbed(interaction, `[ No matches for **${query}** ]`);
  }

  util.addToAuditLog(player, interaction.user, 'Added a track (or a playlist) to the queue');

  if (res.loadType == 'PLAYLIST_LOADED') {
    const response = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `[ A playlist consisting of **${res.tracks.length} tracks** was detected. What would you like to do? ]`,
          )
          .setColor(util.embedColor),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('load-only-first')
            .setLabel('Load only the first song')
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId('load-everything')
            .setLabel('Load everything')
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId('discard')
            .setLabel('Discard everything')
            .setStyle(ButtonStyle.Secondary),
        ),
      ],
    });

    const button = await response.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
    });

    if (!button) return;

    await button.deferUpdate();

    const embed = new EmbedBuilder().setColor(util.embedColor);
    const replyOptions = { embeds: [embed], components: [] };

    if (button.customId == 'load-only-first') {
      const track = res.tracks[0];
      track.info.requester = interaction.member;
      player.queue.add(track);

      embed.setDescription('[ Added the first track to the queue. ]');
    } else if (button.customId == 'load-everything') {
      for (const track of res.tracks) {
        track.info.requester = interaction.member;
        player.queue.add(track);
      }

      embed.setDescription(`[ Added **${res.tracks.length}** tracks to the queue. ]`);
    } else {
      embed.setDescription('[ Discarded everything. ]');
    }

    interaction.editReply(replyOptions);
  } else {
    const track = res.tracks[0];
    track.info.requester = interaction.member;
    player.queue.add(track);

    const tracksAddedPlaylist = new EmbedBuilder()
      .setDescription(`[ Track **${track.info.title}** added to queue. ]`)
      .setColor(util.embedColor);

    await interaction.editReply({ embeds: [tracksAddedPlaylist] });
  }

  if (!player.isPlaying && player.isConnected) player.play();
}

const play: Subcommand = {
  musicOptions: {
    requiresPlayer: false,
    requiresPlaying: false,
    requiresVc: true,
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer,
    client: ExtClient,
  ) => {
    if (!interaction.inCachedGuild()) return;
    await interaction.deferReply({ ephemeral: !config.player.announcePlayerActions });

    const query = interaction.options.getString('url-or-search', true);

    if (!player) {
      player = client.poru.createConnection({
        guildId: interaction.guildId,
        voiceChannel: interaction.member.voice.channelId!,
        textChannel: interaction.channelId,
        deaf: true,
        mute: false,
      }) as ExtPlayer;
    }

    player.setVolume(75); // Set the volume to 75 to not make people's ears bleed
    // They can just change it themselves if the need to lol
    // Also makes audio clearer

    await loadTrack(interaction, client, player, query);

    player.guildId = interaction.guildId;
  },
};

export default play;
