import { ButtonInteraction } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import dayjs from 'dayjs';
import PlayerEmbedManager from '../../bot_data/playerEmbedManager';

export const togglePlayback = (
  interaction: ButtonInteraction,
  player: ExtPlayer
) => {
  const isPaused = player.isPaused;

  // Append to audit log
  player.auditLog = [
    ...(player.auditLog ? player.auditLog : []),
    {
      date: dayjs(),
      func: `${!player.isPaused ? 'Resumed' : 'Paused'} the player`,
      user: interaction.user,
    },
  ];

  player.pause(!isPaused);

  if (player.message) {
    const builder = new PlayerEmbedManager(player);
    const embed = builder.constructSongStateEmbed();
    const newRow = builder.constructRow();

    player.message.edit({
      embeds: [embed],
      components: [newRow],
    });
  }

  return interaction.reply({
    embeds: [
      {
        description: `[ ${player.isPaused ? 'Paused' : 'Resumed'}. ]`,
        color: 9109708,
      },
    ],
  });
};
