import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import addToAuditLog from '../../bot_data/addToAduitLog';
import util from '../../misc/Util';

// Check if string is in HH?:MM:SS format
function validateTimestamp(timestamp: string): boolean {
  const parts = timestamp.split(':');

  if (![3, 2].includes(parts.length)) return false;

  return true;
}

function convertToSeconds(timestamp: string): number {
  const parts = timestamp.split(':');
  if (parts.length === 2) {
    // If the timestamp is in "MM:SS" format, assume hours part is 0.
    parts.unshift('0');
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

export async function seek(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer
) {
  if (!interaction.inCachedGuild()) return;

  if (!player.currentTrack.info.isSeekable) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ This track is not seekable. ]')
          .setColor(util.twmPurpleHex),
      ],
      ephemeral: true,
    });
  }

  if (!player.isPlaying) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Nothing is playing right now. ]')
          .setColor(util.twmPurpleHex),
      ],
    });
  }

  const seconds = interaction.options.getString('time', true);

  let pos: number;
  let responseString: string;

  if (validateTimestamp(seconds)) {
    pos = convertToSeconds(seconds) * 1000;
    responseString = `Seeked to ${seconds}`;
  } else if (['+', '-'].includes(seconds.charAt(0))) {
    const direction = seconds.charAt(0) === '-' ? -1 : 1;
    const time = parseInt(seconds.slice(1)) * 1000;

    pos = player.position + direction * time;
    responseString = `Seeked ${seconds.slice(1)} ${
      direction == 1 ? 'forward' : 'backwards'
    }`;
  } else {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Invalid timestamp. ]')
          .setColor(util.twmPurpleHex),
      ],
      ephemeral: true,
    });
  }

  addToAuditLog(player, interaction.user, responseString);

  player.seekTo(pos);

  interaction.reply({
    embeds: [{ description: '[ Done. ]', color: 9109708 }],
    ephemeral: true,
  });
}
