import { EmbedBuilder, Interaction, InteractionReplyOptions } from 'discord.js';
import Command from './EventHelpers/Command';
import Button from './EventHelpers/Button';
import { logger } from '../misc/logger';
import Autocomplete from './EventHelpers/Autocomplete';

async function replyOrFollowup(
  interaction: Interaction,
  options: InteractionReplyOptions
) {
  if (interaction.isCommand() || interaction.isButton()) {
    await (interaction.replied
      ? interaction.followUp(options)
      : interaction.reply(options));
  }
}

const InteractionCreate = async (interaction: Interaction) => {
  if (interaction.isAutocomplete()) {
    Autocomplete(interaction);
  }
  if (interaction.isCommand()) {
    try {
      return await Command(interaction);
    } catch (error) {
      logger.error(
        `Failed to run command ${interaction.command!.name}: ${error.stack}`
      );

      await replyOrFollowup(interaction, {
        embeds: [
          new EmbedBuilder().setDescription(
            `[ A error has occured while processing this command. ]`
          ),
        ],
        ephemeral: true,
      });
    }
  }

  if (interaction.isButton()) {
    try {
      return await Button(interaction);
    } catch (error) {
      logger.error(`Failed to run button ${interaction.customId}: ${error.stack}`);

      await replyOrFollowup(interaction, {
        embeds: [
          new EmbedBuilder().setDescription(
            `[ A error has occured while processing this button. ]`
          ),
        ],
        ephemeral: true,
      });
    }
  }
};

export default InteractionCreate;
