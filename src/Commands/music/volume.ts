import { SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

const volume: Command<true> = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Sets the music volume.')
    .addNumberOption(vol => vol
      .setName('value')
      .setDescription('Volume to be set in %')
      .setMaxValue(100)
      .setMinValue(0)
      .setRequired(true)
    ),

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: false,
    requiresVc: true
  },

  permissions: {
    bot: ['SendMessages', 'Connect', 'Speak'],
    user: ['SendMessages', 'Connect', 'Speak'],
  },

  callback: async ({ interaction, player }) => {
    const volume = interaction.options.getNumber('value', true)

    await player.setVolume(volume)
    
    interaction.reply({
      content: `\`✅\` - Volume set to \`${volume}%\``,
      ephemeral: true
    })
  }
}

export default volume