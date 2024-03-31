import CreateVote, { VoteStatus } from '../../../Helpers/CreateVote'
import { Button } from '../../../Types/Button'

const skip: Button = {
  name: 'skip',
  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  run: async ({ interaction, player }) => {
    if (!interaction.channel?.isTextBased()) {
      return interaction.reply({
        content: 'This button must be used in a text channel so the bot can send a voting message.',
        ephemeral: true
      })
    }
  
    const member = await interaction.guild?.members.fetch(interaction.user.id)
  
    if (!member?.voice.channel) return // Typeguard
  
    if (player.votingActive) {
      return interaction.reply({
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
      voiceText: interaction.channel as any,
      voiceChannel: member.voice.channel,
      time: 60000
    })
  
    const replies = {
      [VoteStatus.Success]: `Song **${player.currentTrack.info.title}** skipped.`,
      [VoteStatus.Error]: `There was an error while voting: \`${error}\``,
      [VoteStatus.Failure]: 'There are not enough votes to skip the current song.'
    }
  
    interaction.editReply({
      content: replies[status],
    })
  
    player.votingActive = false
    player.stop()
  }
}

export default skip
