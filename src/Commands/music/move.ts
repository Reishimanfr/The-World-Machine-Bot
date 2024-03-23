import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'

const move: Command = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Moves the music player to a different channel.')
    .addChannelOption(vc => vc
      .setName('channel')
      .setDescription('Voice channel to move the bot to.')
      .addChannelTypes(ChannelType.GuildVoice)
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
    const curChannel = player.voiceChannel
    const newChannel = interaction.options.getChannel('channel', true)

    if (curChannel === newChannel.id) {
      return interaction.reply({
        content: 'Can\'t move to the same channel I\'m currently in!.',
        ephemeral: true
      })
    }

    const fetchChannel = await interaction.guild?.channels.fetch(newChannel.id)

    if (!fetchChannel || fetchChannel.type !== ChannelType.GuildVoice) return

    if (!fetchChannel.joinable) {
      return interaction.reply({
        content: 'I can\'t join that voice channel!',
        ephemeral: true
      })
    }

    player.setVoiceChannel(fetchChannel.id)

    interaction.reply({
      content: `Moved to channel <#${fetchChannel.id}>!\n:information_source: Notice: music playback has been paused. Resume it using the \`/pause\` command when you're ready!`,
      ephemeral: true
    })
  }
}

export default move