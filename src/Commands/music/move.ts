import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

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
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Can\'t move to the same channel I\'m in. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    const fetchChannel = await interaction.guild?.channels.fetch(newChannel.id)

    if (!fetchChannel || fetchChannel.type !== ChannelType.GuildVoice) return

    if (!fetchChannel.joinable) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ I can\'t join that voice channel. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    player.setVoiceChannel(fetchChannel.id)

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ Moved to "${fetchChannel.name}". Playback will resume when someone joins the voice channel. ]`)
          .setColor(embedColor)
      ],
      ephemeral: true
    })
  }
}

export default move