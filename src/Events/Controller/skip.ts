import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import dayjs from 'dayjs';
import util from '../../misc/Util';

export const skip = (interaction: ButtonInteraction, player: ExtPlayer) => {
  player.seekTo(player.currentTrack.info.length);

  player.auditLog = [
    ...(player.auditLog ? player.auditLog : []),
    {
      date: dayjs(),
      func: `Skipped a song`,
      user: interaction.user,
    },
  ];

  return interaction.editReply({
    embeds: [
      new EmbedBuilder().setDescription(`[ Skipped. ]`).setColor(util.twmPurpleHex),
    ],
  });
};
