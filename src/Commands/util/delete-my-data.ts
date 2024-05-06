import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'
import { playlists } from '../../Models'
import { logger } from '../../Helpers/Logger'

const deleteMyData: Command<false> = {
  data: new SlashCommandBuilder()
    .setName('delete-my-data')
    .setDescription('Deletes everything from the database related to you.'),

  permissions: {},

  callback: async ({ interaction }) => {
    const confirmationMessage = await interaction.reply({
      content: 'Are you absolutely sure you want to delete everything in the database related to you?\n:warning: **This will also delete any playlists you created/imported.**\nServer specific music player settings won\'t be changed in any way.',
      ephemeral: true,
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('yes')
              .setEmoji('✅')
              .setLabel('Yes, I\'m 100% sure.')
              .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
              .setCustomId('no')
              .setEmoji('❌')
              .setLabel('No, I\'ve changed my mind.')
              .setStyle(ButtonStyle.Secondary),
          )
      ]
    })

    const optionCollector = await confirmationMessage.awaitMessageComponent({
      componentType: ComponentType.Button,
      idle: 120000
    })

    if (!optionCollector) {
      return interaction.editReply({
        components: [],
        content: 'Command timed out. Your data will not be deleted.'
      })
    } 

    if (optionCollector.customId === 'no') {
      return interaction.editReply({
        components: [],
        content: 'Cancelling data deletion.'
      })
    }

    const toDelete = [playlists] // Array in case we want to add something here

    for (const part of toDelete) {
      try {
        await part.destroy({ where: { userId: interaction.user.id } })
      } catch (error) {
        logger.error(`Failed to delete user data for ${interaction.user.id}: ${error.stack}`)
      }
    }
  }
}

export default deleteMyData