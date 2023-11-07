import {
  ActionRowBuilder,
  AnySelectMenuInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { v4 as UUID } from "uuid";
import { ExtClient, ExtPlayer } from "../../../Helpers/ExtendedClient";
import { logger } from "../../../Helpers/Logger";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";
import { playerOverrides } from "../../../Helpers/DatabaseSchema";
import { PlayerSettings, config } from "../../../config";

type interactionType =
  | ChatInputCommandInteraction
  | AnySelectMenuInteraction
  | ButtonInteraction;

async function sendEmbed(
  interaction: interactionType,
  description: string
): Promise<any> {
  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(util.embedColor);

  try {
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error while sending play callback: ${error}`);
  }
}

export async function loadTrack(
  interaction: interactionType,
  client: ExtClient,
  player: ExtPlayer,
  query: string
) {
  const result = await client.poru.resolve({
    query: query,
    source: "ytsearch",
    requester: interaction.member
  });


  if (result.loadType == "LOAD_FAILED") {
    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setDescription(`[ Failed to load track for **${query}**. ]`)
        .setColor(util.embedColor)
      ],
    })
  }

  if (result.loadType == "NO_MATCHES") {
    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setDescription(`[ No matches for **${query}**. ]`)
        .setColor(util.embedColor)
      ],
    })
  }

  util.addToAuditLog(
    player,
    interaction.user,
    "Added a track (or a playlist) to the queue"
  );

  if (result.loadType == "PLAYLIST_LOADED") {
    const actionEmbed = new EmbedBuilder()
      .setDescription(`[ A playlist consisting of **${result.tracks.length}** tracks was found. Do you want to load them? ]`)
      .setColor(util.embedColor);

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("load-playlist")
        .setEmoji('✅')
        .setLabel("Load them!")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("discard-playlist")
        .setEmoji('❌')
        .setLabel("Discard them!")
        .setStyle(ButtonStyle.Secondary)
    )

    const response = await interaction.editReply({
      embeds: [actionEmbed],
      components: [buttonRow],
    });

    const button = await response.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
    });

    if (!button) return;

    await button.deferUpdate();

    if (button.customId == "load-playlist") {
      result.tracks.map(track => {
        player.queue.add(track);
      })
      sendEmbed(interaction, `[ **${result.tracks.length}** tracks were added to the queue. ]`);
    } else {
      sendEmbed(interaction, "[ Playlist discarded. ]");
    }
  }

  if (result.loadType == 'TRACK_LOADED' || result.loadType == 'SEARCH_RESULT') {
    const track = result.tracks[0];
    track.info.requester = interaction.member;
    player.queue.add(track);


    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setDescription(`[ Track **${track.info.title}** added to queue. ]`)
        .setColor(util.embedColor)]
    })
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
    client: ExtClient
  ) => {
    if (!interaction.inCachedGuild()) return;
    await interaction.deferReply({
      ephemeral: true
    });

    const query = interaction.options.getString("url-or-search", true);

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

    if (!player.guildId) {
      player.guildId = interaction.guildId;
    }

    if (!player.UUID) {
      player.UUID = UUID();
    }

    if (!player.settings) {
      const defaultPlayerConfig = config.player
      const request = await playerOverrides.findOne({ where: { guildId: interaction.guild!.id } })
      const configOverrides = await request?.dataValues

      const settings: any = {}
      const keys = Object.keys(defaultPlayerConfig)
      const values = Object.values(defaultPlayerConfig)

      for (let i = 0; i < keys.length; i++) {
        const cur = keys[i]
        const curOverride = configOverrides?.[keys[i]] ?? null
        settings[cur] = curOverride ?? values[i]

        player.settings = settings as PlayerSettings
      }
    }
  },
};

export default play;
