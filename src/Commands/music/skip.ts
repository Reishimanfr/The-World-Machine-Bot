import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import CreateVote, { VoteStatus } from '../../Helpers/CreateVote'
import type { Command } from '../../Types/Command'
import { logger } from '../../Helpers/Logger'

const skip: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect', 'SendMessages'],
    bot: ['Speak', 'Connect', 'SendMessages']
  },

  musicOptions: {
    requiresPlaying: true,
    requiresVc: true,
    requiresDjRole: true
  },

  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the currently playing song.'),

  helpData: {
    description: 'Skips the currently playing song. If there\'s enough members **(configurable)** in the voice channel a voting will take place where users choose if they want to skip the song or not.',
    examples: ['```/skip```']
  },

  callback: async ({ interaction, player, client }) => {
    if (!interaction.channel?.isTextBased()) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ This command must be used in a text based channel. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    const permissions = interaction.channel.permissionsFor(client.user.id)

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

    const member = await interaction.guild?.members.fetch(interaction.user.id)

    if (!member?.voice.channel) return // Typeguard 

    if (player.votingActive) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Please wait before the current vote ends. ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }

    const nonBotMembers = member.voice.channel.members.filter(m => !m.user.bot).size
    const requiredVotes = Math.round((nonBotMembers * (player.settings.voteSkipThreshold / 100)))

    if (requiredVotes > 1) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Waiting for members to place their votes... ]')
            .setColor(embedColor)
        ],
        ephemeral: true
      })

      player.votingActive = true

      const [status, error] = await CreateVote({
        interaction,
        reason: 'Wants to skip the current song',
        requiredVotes,
        voiceText: interaction.channel,
        voiceChannel: member.voice.channel,
        time: 60000
      })

      player.votingActive = false

      switch (status) {
        case VoteStatus.Success: {

          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`[ Song \`${player.currentTrack.info.title}\` skipped. ]`)
                .setColor(embedColor)
            ],
          })
          player.stop()
          break
        }

        case VoteStatus.Failure: {
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription('[ Song won\'t be skipped because not enough users voted "yes". ]')
                .setColor(embedColor)
            ],
          })
          break
        }

        case VoteStatus.Error: {
          logger.error(`Failed to finish skip voting: ${error?.stack}`)
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`[ Vote skipping failed with an error. ]\nError message: \`\`\`${error?.stack}\`\`\``)
                .setColor(embedColor)
            ],
          })
          break
        }
      }
    } else {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`[ Song \`${player.currentTrack.info.title}\` skipped. ]`)
            .setColor(embedColor)
        ],
      })
      player.stop()
    }
  }
}

export default skip
