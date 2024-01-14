import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { client } from '../../..';
import { ExtPlayer } from '../../../Helpers/ExtendedClasses';
import { logger } from '../../../Helpers/Logger';
import { MessageManager } from '../../../Helpers/MessageManager';
import { PlayerController } from '../../../Helpers/PlayerController';
import { QueueManager } from '../../../Helpers/QueueManager';
import { embedColor } from '../../../Helpers/Util';
import { buttonMap } from './ButtonHandlers/!buttonHandler';

const Button = async (interaction: ButtonInteraction) => {
  const guild = interaction.guild
  const id = interaction.customId

  // Typeguard
  if (!guild) return

  if (id.startsWith('songcontrol')) {
    const player = client.poru.players.get(guild.id) as ExtPlayer | undefined
    const member = await guild.members.fetch(interaction.user.id)

    if (!player) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ This player isn't active anymore. ]")
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    if (!member.voice.channel) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in a voice channel to use this. ]')
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    if (member.voice.channelId !== guild.members.me?.voice.channelId) {
      return await interaction.reply({
        content: 'You must be in the same voice channel to use this.',
        ephemeral: true
      });
    }

    const action = interaction.customId.split('-')[1];
    const handler = buttonMap[action];

    // Managers
    // May plug this in to the player class instead
    // We'll see
    const controller = new PlayerController(player)
    const builder = new MessageManager(player)
    const queue = new QueueManager(player)

    const args = {
      interaction,
      player,
      client,
      controller,
      builder,
      queue
    };

    // Shouldn't happen
    if (!player.isPlaying && !player.isPaused) {
      return interaction.reply({
        content: 'Nothing is playing right now.',
        ephemeral: true
      })
    }

    try {
      await handler(args);
    } catch (error) {
      logger.error(`Failed to process button ${interaction.customId}: ${error}`);
    }
  }
};

export default Button;
