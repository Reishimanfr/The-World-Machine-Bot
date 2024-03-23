import {
  ChannelType,
  SlashCommandBuilder
} from 'discord.js'
import CreateVote, { VoteStatus } from '../../Helpers/CreateVote'
import { Command } from '../../Types/Command'
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

  callback: async ({ interaction, player }) => {
    if (interaction.channel?.type !== ChannelType.GuildText) {
      return await interaction.reply({
        content: 'This command must be ran in a text channel so the bot can send a voting message.',
        ephemeral: true
      })
    }

    const member = await interaction.guild?.members.fetch(interaction.user.id)

    if (!member?.voice.channel) {
      return await interaction.reply({
        content: 'You must be in a voice channel to use this command.',
        ephemeral: true
      })
    }

    if (player.votingActive) {
      return await interaction.reply({
        content: 'There\'s a vote skip in progress already!',
        ephemeral: true
      })
    }

    const nonBotMembers = member.voice.channel.members.filter(m => !m.user.bot).size
    const requiredVotes = Math.round((nonBotMembers * (player.settings.voteSkipThreshold / 100)))

    if (requiredVotes > 1) {
      await interaction.reply({
        content: 'Waiting for members to place their votes...',
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
          interaction.editReply(`Song **${player.currentTrack.info.title}** skipped.`)
          player.stop()
          break
        }

        case VoteStatus.Failure: {
          interaction.editReply('Other members didn\'t agree to skip the current song.')
          break
        }

        case VoteStatus.Error: {
          logger.error(`Failed to finish skip voting: ${error?.stack}`)
          interaction.editReply(`Voting failed with a error: \`\`\`${error?.message}\`\`\``)
          break
        }
      }
    } else {
      interaction.reply({
        content: `Song **${player.currentTrack.info.title}** skipped.`,
        ephemeral: true
      })
      player.stop()
    }
  }
}

export default skip
