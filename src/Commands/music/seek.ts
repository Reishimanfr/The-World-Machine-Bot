import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { embedColor } from "../../Helpers/Util";
import Command from "../../types/Command";

// Check if string is in HH?:MM:SS format
function validateTimestamp(timestamp: string): boolean {
  const parts = timestamp.split(":");

  if (![3, 2].includes(parts.length)) return false;

  return true;
}

function convertToSeconds(timestamp: string): number {
  const parts = timestamp.split(":");
  if (parts.length === 2) {
    // If the timestamp is in "MM:SS" format, assume hours part is 0.
    parts.unshift("0");
  } else if (parts.length !== 3) {
    return 0;
  }

  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseInt(parts[2]);

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return 0;
  }

  if (hours < 0 || minutes < 0 || seconds < 0 || minutes > 59 || seconds > 59) {
    return 0;
  }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}


const seek: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect', 'SendMessages'],
    bot: ['Speak', 'Connect', 'SendMessages'],
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seeks to a point in the playing song")
    .addStringOption(timestamp => timestamp
      .setName("time")
      .setDescription("Timestamp to skip to (HH:MM:SS format)")
      .setRequired(true)
    ),

  callback: ({ interaction, player }) => {
    if (!interaction.inCachedGuild()) return;

    // You never know
    if (!player.currentTrack.info.isSeekable) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ This track is not seekable. ]")
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    if (!player.isPlaying) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ Nothing is playing right now. ]")
            .setColor(embedColor),
        ],
      });
    }

    const seconds = interaction.options.getString("time", true);

    let pos: number;
    let responseString: string;

    if (validateTimestamp(seconds)) {
      pos = convertToSeconds(seconds) * 1000;
      responseString = `Seeked to ${seconds}`;
    } else if (["+", "-"].includes(seconds.charAt(0))) {
      const direction = seconds.startsWith("-") ? -1 : 1;
      const time = parseInt(seconds.slice(1)) * 1000;

      pos = player.position + direction * time;
      responseString = `Seeked ${seconds.slice(1)} ${direction == 1 ? "forward" : "backwards"
        }`;
    } else {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ Invalid timestamp. ]")
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    player.seekTo(pos);

    interaction.reply({
      content: responseString,
      ephemeral: true
    });
  },
}

export default seek