import { SlashCommandBuilder } from 'discord.js'
import { Command } from '../../Types/Command'

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

    // Typeguard
    if (!channel) return

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: 'You have to use this command in a text channel.',
        ephemeral: true
      })
    }

    if (channel.isDMBased()) {
      return interaction.reply({
        content: 'You can\'t use this command in DMs.'
      })
    }

    const permissions = channel.permissionsFor(client.user.id)

    if (permissions === null) {
      return interaction.reply({
        content: 'Something went wrong while checking bot permissions.',
        ephemeral: true
      })
    }

    if (!permissions.has('SendMessages')) {
      return interaction.reply({
        content: 'I can\'t send messages in this channel.',
        ephemeral: true
      })
    }

    player.message?.delete()
      .catch(() => { })

    interaction.reply({
      content: 'The now playing message has been re-sent.',
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
