import { ButtonInteraction } from 'discord.js';
import { ExtPlayer } from '../../../../Helpers/ExtendedClient';
import util from '../../../../Helpers/Util';
import PlayerEmbedManager from '../../../../functions/playerEmbedManager';

export const loop = (interaction: ButtonInteraction, player: ExtPlayer) => {
  const { loop } = player;

  loop == 'NONE' ? player.setLoop('TRACK') : player.setLoop('NONE');

  util.addToAuditLog(player, interaction.user, `Toggled looping (${player.loop})`);

  if (player?.message) {
    const row = new PlayerEmbedManager(player).constructRow();

    player.message.edit({
      components: [row],
    });
  }

  return interaction.editReply({
    embeds: [
      {
        description: `[ ${player.loop == 'TRACK' ? 'Looping this track' : 'Looping disabled'}. ]`,
        color: 9109708,
      },
    ],
  });
};
