import { ButtonInteraction } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import PlayerEmbedManager from '../../bot_data/playerEmbedManager';
import addToAuditLog from '../../bot_data/addToAduitLog';

export const loop = (interaction: ButtonInteraction, player: ExtPlayer) => {
  const { loop } = player;

  loop == 'NONE' ? player.setLoop('TRACK') : player.setLoop('NONE');

  addToAuditLog(player, interaction.user, `Toggled looping (${player.loop})`);

  if (player?.message) {
    const row = new PlayerEmbedManager(player).constructRow();

    player.message.edit({
      components: [row],
    });
  }

  return interaction.reply({
    embeds: [
      {
        description: `[ ${
          player.loop == 'TRACK' ? 'Looping this track' : 'Looping disabled'
        }. ]`,
        color: 9109708,
      },
    ],
  });
};
