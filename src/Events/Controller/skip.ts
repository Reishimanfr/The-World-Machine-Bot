import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import dayjs from 'dayjs';

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

  return interaction.reply({
    embeds: [new EmbedBuilder().setDescription(`[ Skipped. ]`).setColor('#8b00cc')],
  });
};
