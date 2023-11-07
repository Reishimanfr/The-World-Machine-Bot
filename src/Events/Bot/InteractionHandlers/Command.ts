import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { client } from '../../..';
import { logger } from '../../../Helpers/Logger';
import util from '../../../Helpers/Util';
import commandList from '../../../functions/commandList';
import { config } from '../../../config';

const Command = async (interaction: CommandInteraction) => {
  const command = commandList.find((command) => command.data.name == interaction.commandName);

  if (config.maintenance) {
    return interaction.reply({
      content: 'The bot is down for maintenance.',
      ephemeral: true
    })
  }

  if (!command) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("[ This command doesn't exist! ]")
          .setColor(util.embedColor),
      ],
      ephemeral: true,
    });
  }

  // Missing permissions check
  if (command.permissions) {
    const currentPerms = interaction.guild?.members.me?.permissions;
    const missingPermissions = command.permissions.filter((perm) => !currentPerms?.has(perm));

    if (missingPermissions.length) {
      return interaction.reply({
        content: "I'm missing permissions required for this command. Please try again after giving me these permissions:\n" + missingPermissions.join(', '),
        ephemeral: true
      })
    }
  }

  try {
    await command.callback(interaction, client);
  } catch (error) {
    logger.error(`Command ${interaction.commandName} failed: ${error}`);
  }
};

export default Command;
