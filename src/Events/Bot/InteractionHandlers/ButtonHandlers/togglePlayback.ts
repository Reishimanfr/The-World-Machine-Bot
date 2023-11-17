import { ButtonInteraction } from 'discord.js';
import { ExtPlayer } from '../../../../Helpers/ExtendedClasses';
import PlayerEmbedManager from '../../../../functions/MusicEmbedManager';

export const togglePlayback = async (interaction: ButtonInteraction, player: ExtPlayer) => {
  const isPaused = player.isPaused;

  player.pause(!isPaused);

  if (player.message) {
    const builder = new PlayerEmbedManager(player);
    const embed = await builder.constructSongStateEmbed();
    const newRow = builder.constructRow();

    player.message.edit({
      embeds: [embed],
      components: [newRow],
    });
  }

  return interaction.editReply({
    embeds: [
      {
        description: `[ ${player.isPaused ? 'Paused' : 'Resumed'}. ]`,
        color: 9109708,
      },
    ],
  });
};
