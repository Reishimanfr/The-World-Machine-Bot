import { SlashCommandBuilder } from 'discord.js'
import type Command from '../../types/Command'

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
    .setDescription('Destroys the player and disconnects the bot.'),

  helpData: {
    description: 'Disconnects the bot from voice channel ending the session.',
    examples: ['```/disconnect```']
  },

  callback: async ({ interaction, player }) => {
    player.disconnect()

    await interaction.reply({
      content: 'The bot has been disconnected.'
    })
  }
}

export default disconnect
