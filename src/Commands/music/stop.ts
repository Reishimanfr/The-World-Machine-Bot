import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'

const stop: Command<true> = {
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
    .setName('stop')
    .setDescription('Disconnects the bot from the voice channel and ends the session. Alias to /disconnect.'),

  helpData: {
    description: 'Disconnects the bot from voice channel ending the session. **This is an alias to /disconnect**',
    examples: ['```/stop```']
  },

  callback: async ({ interaction, player }) => {
    player.disconnect()
    await interaction.reply('`✅` - The bot has been disconnected from voice channel.')
  }
}

export default stop
