import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  VoiceChannel,
} from "discord.js";
import { setTimeout } from "timers/promises";
import { ExtPlayer } from "../../../Helpers/ExtendedClient";
import { logger } from "../../../Helpers/Logger";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";

async function skipvote(
  interaction: CommandInteraction | ButtonInteraction,
  player: ExtPlayer
) {
  const channel = (await interaction.guild!.channels.fetch(player.voiceChannel)) as VoiceChannel;
  // Amount of members without bots
  const memberCount = channel.members.filter((m) => !m.user.bot).size;

  if (
    !player.settings.enableSkipvote
    // memberCount < player.settings.skipvoteMemberRequirement
  ) {
    util.addToAuditLog(
      player,
      interaction.user,
      "Skipped a song: " + player.currentTrack!.info.uri
    );
    player.seekTo(player.currentTrack!.info.length);

    const options = {
      embeds: [
        new EmbedBuilder()
          .setDescription("[ Song skipped. ]")
          .setColor(util.embedColor),
      ],
    };

    if (interaction.isButton()) {
      interaction.editReply(options);
    } else {
      interaction.reply({ options, ephemeral: true });
    }

    return;
  }

  const requiredVotes = Math.round(
    (memberCount * player.settings.skipvoteThreshold) / 100
  );

  const buttons: ButtonBuilder[] = [
    new ButtonBuilder()
      .setCustomId("yes")
      .setEmoji("✅")
      .setLabel("Skip!")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("no")
      .setEmoji("❌")
      .setLabel("Don't skip!")
      .setStyle(ButtonStyle.Primary),
  ];

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
  const timestamp = Math.trunc(Date.now() / 1000 + 60);

  let yesVotes = 0;
  let noVotes = 0;
  let votedUsers: Array<string> = [];

  const res = await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} wants to skip the current song`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(
          `[ Current votes: :white_check_mark: **${yesVotes}/${requiredVotes}**. Will expire in <t:${timestamp}:R> ]`
        )
        .setColor(util.embedColor),
    ],
    components: [row],
  });

  const collect = res.createMessageComponentCollector({
    max: memberCount,
    filter: async (u) => {
      // Is in the same voice channel as bot
      const member = await interaction.guild?.members.fetch(u.user.id);
      return member?.voice.channel?.id == player.voiceChannel;
    },
    componentType: ComponentType.Button,
    time: 60000, // one minute
  });

  collect.on("collect", async (collected) => {
    await collected.deferUpdate();
    const member = await util.fetchMember(collected.guildId!, collected.user.id);

    if (!member.voice.channel) {
      collected.followUp({
        content: "You must be in a voice channel to vote",
        ephemeral: true,
      });
      return;
    }

    if (member.voice.channel.id !== player.voiceChannel) {
      collected.followUp({
        content: "You must be in the same voice channel to vote",
        ephemeral: true,
      });
      return;
    }

    if (votedUsers.includes(collected.user.id)) {
      collected.followUp({
        content: "You have already placed a vote.",
        ephemeral: true,
      });
      return;
    }

    collected.customId == "yes" ? (yesVotes += 1) : (noVotes += 1);
    votedUsers.push(collected.user.id);

    if (yesVotes >= requiredVotes) {
      collect.stop("Enough votes collected");
    }

    const embed = EmbedBuilder.from((await res.fetch()).embeds[0]);

    res.edit({
      embeds: [
        embed.setDescription(
          `[ Current votes: :white_check_mark: **${yesVotes}/${requiredVotes}**. Will expire in <t:${timestamp}:R> ]`
        ),
      ],
    });
  });

  collect.on("end", async (_, reason) => {
    const success = yesVotes >= requiredVotes;

    if (reason == "limit") reason = "Everyone voted";
    if (reason == "time") reason = "Voting time passed";

    res.edit({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Skipvote ended: ${reason}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `[ ${success ? ":white_check_mark:" : ":x:"} The song ${success ? "will" : "won't"
            } be skipped. ]`
          )
          .setColor(util.embedColor),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          buttons.map((b) => b.setDisabled(true))
        ),
      ],
    });

    if (success) {
      util.addToAuditLog(
        player,
        interaction.user,
        "Skipped a song: " + player.currentTrack.info.uri
      );
      player.seekTo(player.currentTrack.info.length);
    }

    await setTimeout(10000); // 10s

    try {
      await res.delete();
    } catch (e) {
      logger.error(`Failed to delete voting message`);
      logger.error(e.stack);
    }
  });
}
const skip: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: true,
    requiresVc: true,
  },

  callback: async (interaction, player: ExtPlayer) => {
    await skipvote(interaction, player);
  },
};

export default skip;
export { skipvote };
