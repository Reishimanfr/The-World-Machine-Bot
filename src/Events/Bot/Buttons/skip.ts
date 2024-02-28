import { ChannelType, TextChannel } from 'discord.js'
import CreateVote, { VoteStatus } from '../../../Helpers/CreateVote'
import { Button } from '../../../Types/Button'

export const skip: Button = async ({ interaction, player }) => {
  if (interaction.channel?.type !== ChannelType.GuildText) {
    return await interaction.reply({
      content: 'This button must be used in a text channel so the bot can send a voting message.',
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

  await interaction.reply({
    content: 'Waiting for members to place their votes...',
    ephemeral: true
  })

  const nonBotMembers = member.voice.channel.members.filter(m => !m.user.bot).size
  const requiredVotes = Math.round((nonBotMembers * (player.settings.voteSkipThreshold / 100)))

  player.votingActive = true

  const [status, error] = await CreateVote({
    interaction,
    reason: 'Wants to skip the current song',
    requiredVotes,
    voiceText: interaction.channel as TextChannel,
    voiceChannel: member.voice.channel,
    time: 60000
  })

  switch (status) {
  case VoteStatus.Success: {
    interaction.editReply(`Song **${player.currentTrack.info.title}** skipped!`)
    player.stop()
    break
  }
  case VoteStatus.Failure: {
    interaction.editReply('The voting resulted in a failure!')
    break
  }
  case VoteStatus.Error: {
    interaction.editReply(`Voting failed: \`\`\`${error?.message}\`\`\``)
    break
  }
  }

  player.votingActive = false
}

