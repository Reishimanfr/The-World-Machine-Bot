import { Embed, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import type { Command } from '../../Types/Command'

const nowPlaying: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect', 'SendMessages'],
    bot: ['Speak', 'Connect', 'SendMessages']
  },

  musicOptions: {
    requiresVc: true,
    requiresPlaying: true
  },

  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Re-sends the now playing message'),

  helpData: {
    description: 'Re-sends the now playing message and deletes the old one.',
    examples: ['```/nowplaying```']
  },

  callback: async ({ interaction, client, player }) => {
    const channel = interaction.channel

    if (!channel?.isTextBased() || channel.isDMBased()) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You have to use this in a text channel. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    const permissions = channel.permissionsFor(client.user.id)

    if (!permissions?.has('SendMessages')) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ I can\'t send messages in this channel. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    player.message?.delete()
      .catch(() => { })

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ Message re-sent. ]')
          .setColor(embedColor)
      ],
      ephemeral: true
    })

    const nowPlayingEmbed = await player.messageManger.createPlayerEmbed()
    const buttons = player.messageManger.createPlayerButtons()

    const message = await channel.send({
      embeds: [...nowPlayingEmbed],
      components: [buttons]
    })

    player.textChannel = interaction.channelId
    player.message = message
  }
}

export default nowPlaying
