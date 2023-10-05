import { ButtonInteraction } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import PlayerEmbedManager from '../../functions/playerEmbedManager';
import util from '../../misc/Util';

export const togglePlayback = async (interaction: ButtonInteraction, player: ExtPlayer) => {
  const isPaused = player.isPaused;

  // Append to audit log
  util.addToAuditLog(player, interaction.user, !player.isPaused ? 'Resumed' : 'Paused' + ' the player');

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
