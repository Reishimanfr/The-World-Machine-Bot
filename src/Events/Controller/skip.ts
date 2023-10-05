import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import util from '../../misc/Util';

export const skip = (interaction: ButtonInteraction, player: ExtPlayer) => {
  player.seekTo(player.currentTrack.info.length);

  util.addToAuditLog(player, interaction.user, 'Skipped a song');

  return interaction.editReply({
    embeds: [
      new EmbedBuilder().setDescription(`[ Skipped. ]`).setColor(util.twmPurpleHex),
    ],
  });
};
