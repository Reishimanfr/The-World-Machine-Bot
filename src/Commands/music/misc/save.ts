import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  DMChannel,
  EmbedBuilder,
} from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClasses";
import { logger } from "../../../Helpers/Logger";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";
import { formatSeconds } from "../../../functions/FormatSeconds";

const sourceLogos = {
  spotify: '<:spotify:1171916955268169778>',
  youtube: '<:youtuberemovebgpreview:1171917891059331103>',
  soundcloud: '<:soundcloud:1171916943192752199>'
}

const save: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: false,
    requiresDjRole: false
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
    player: ExtPlayer
  ) => {

    if (!player.isPlaying) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setDescription(
            "[ Nothing is playing right now. ]"
          ),
        ],
        ephemeral: true,
      });
    }

    const { info } = player.currentTrack
    let dmChannel: DMChannel;

    try {
      dmChannel = await interaction.user.createDM();
    } catch (error) {
      logger.error(
        `Failed to create dm channel for user ${interaction.user.username} (${interaction.user.id}): ${error}`
      );
      interaction.reply({ content: 'I can\'t DM you!', ephemeral: true })
      return;
    }

    let image = info.image;

    if (info.sourceName == "spotify") {
      const res = await axios.get(
        `https://embed.spotify.com/oembed/?url=spotify:track:${info.identifier}`
      );

      image = res.data.thumbnail_url;
    }

    const member = await util.fetchMember(interaction.guild!.id, interaction.user.id)

    const savedFromRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setDisabled(true)
          .setURL('https://example.com')
          .setStyle(ButtonStyle.Link)
          .setLabel(`Sent from ${interaction.guild?.name}`)
      )

    const saveTrack = new EmbedBuilder()
      .setAuthor({ name: `Originally requested by ${info.requester.user.username}`, iconURL: info.requester.user.displayAvatarURL() })
      .setDescription(`
* **[${info.title} - ${info.author}](${info.uri})**
* Source: **${info.sourceName.charAt(0).toUpperCase() + info.sourceName.slice(1)}** ${sourceLogos[info.sourceName] ?? ''}
* Length: **${formatSeconds(info.length / 1000)}**
Saved from channel <#${member.voice.channel!.id}>`)
      .setImage(image ?? null)
      .setColor(util.embedColor)

    try {
      await dmChannel?.send({
        embeds: [saveTrack],
        components: [savedFromRow]
      });

      await interaction.reply({
        content: 'I\'ve sent you a DM with the song saved!',
        ephemeral: true
      })

    } catch (error) {
      logger.error(
        `[save.ts]: Error while sending to DM channel: ${error}`
      );
    }
  },
};

export default save;
