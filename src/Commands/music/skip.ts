import {
  ChannelType,
  SlashCommandBuilder
} from 'discord.js'
import CreateVote, { VoteStatus } from '../../Helpers/CreateVote'
import type Command from '../../types/Command'

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

    if (player.voteSkipActive) {
      return await interaction.reply({
        content: 'There\'s a vote skip in progress already!',
        ephemeral: true
      })
    }

    interaction.reply({
      content: 'Waiting for members to place their votes...',
      ephemeral: true
    })

    const nonBotMembers = member.voice.channel.members.filter(m => !m.user.bot).size
    const requiredVotes = Math.round((nonBotMembers * (player.settings.voteSkipThreshold / 100)))

    player.voteSkipActive = true

    const [status, error] = await CreateVote({
      interaction,
      reason: 'Wants to skip the current song',
      requiredVotes,
      voiceText: interaction.channel,
      voiceChannel: member.voice.channel,
      time: 60000
    })

    switch (status) {
      case VoteStatus.Success: {
        interaction.editReply(`Song **${player.currentTrack.info.title}** skipped!`)
        player.seekTo(999999999999999)
        break
      }
      case VoteStatus.Failure: {
        interaction.editReply(`The voting resulted in a failure!`)
        break
      }
      case VoteStatus.Error: {
        interaction.editReply(`Voting failed: \`\`\`${error?.message}\`\`\``)
        break
      }
    }

    player.voteSkipActive = false
  }
}

export default skip
