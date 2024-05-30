import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

const disconnect: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect'],
    bot: ['Speak', 'Connect']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: false,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnects the bot from the voice channel and ends the session.'),

  helpData: {
    description: 'Disconnects the bot from voice channel ending the session.',
    examples: ['```/disconnect```']
  },

  callback: async ({ interaction, player }) => {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setDescription('[ Disconnecting from voice channel... ]')
        .setColor(embedColor)
      ],
    })

    player.disconnect()
  }
}

export default disconnect
