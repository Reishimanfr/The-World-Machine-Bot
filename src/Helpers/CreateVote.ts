import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, type ButtonInteraction, type ChatInputCommandInteraction, type VoiceBasedChannel, type VoiceChannel, type TextBasedChannel } from 'discord.js'
import { setTimeout } from 'node:timers/promises'
import { client } from '..'

export enum VoteStatus {
  Failure = 0,
  Success = 1,
  Error = 2
}

async function CreateVote (args: {
  reason: string
  interaction: ChatInputCommandInteraction | ButtonInteraction
  voiceText: TextBasedChannel
  voiceChannel: VoiceChannel | VoiceBasedChannel
  requiredVotes: number
  time: number
}): Promise<[VoteStatus, Error?]> {
  const { reason, voiceText, voiceChannel, requiredVotes, interaction, time } = args

  if (voiceText.isDMBased()) {
    return [VoteStatus.Error, new Error('Invalid channel type. Expected any text based channel apart from DM, which was provided.')]
  }

  if (!voiceText.permissionsFor(client.user?.id)?.has('SendMessages')) {
    return [VoteStatus.Error, new Error('Insufficient permissions in channel: SendMessages permission missing')]
  }

  if (requiredVotes <= 1) {
    return [VoteStatus.Success]
  }

  const buttons: ButtonBuilder[] = [
    new ButtonBuilder()
      .setCustomId('yes')
      .setEmoji('✅')
      .setLabel('Yes!')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId('no')
      .setEmoji('❌')
      .setLabel('No!')
      .setStyle(ButtonStyle.Primary)
  ]

  const buttonsRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(buttons)

  const now = new Date()
  now.setSeconds(now.getSeconds() + (time / 1000))

  const votingTime = Math.trunc(now.getTime() / 1000)

  let votesPlaced = 1
  const votedUsers: string[] = [interaction.user.id]

  const votingEmbed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.username} -> ${reason}`,
      iconURL: interaction.user.displayAvatarURL()
    })
    .setDescription(`Current votes: **${votesPlaced}/${requiredVotes}**\n` +
      `Voting will end <t:${votingTime}:R>`)
    .setColor('#2b2d31')

  const response = await interaction.channel?.send({
    embeds: [votingEmbed],
    components: [buttonsRow]
  })

  if (!response) {
    return [VoteStatus.Error, new Error('Failed to send voting message to text channel.')]
  }

  return await new Promise((resolve) => {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time
    })

    collector.on('collect', async (button) => {
      await button.deferUpdate()
      const member = await interaction.guild?.members.fetch(interaction.user.id)

      if (!member?.voice.channel || member.voice.channel.id !== voiceChannel.id) {
        await button.followUp({
          content: 'You must be in the same voice channel as the bot to place a vote.',
          ephemeral: true
        })
        return
      }

      if (votedUsers.includes(button.user.id)) {
        await button.followUp({
          content: 'You have placed a vote already!',
          ephemeral: true
        })
        return
      }

      if (button.customId === 'yes') votesPlaced += 1
      votedUsers.push(button.user.id)

      if (votesPlaced >= requiredVotes) {
        collector.stop('limit'); return
      }

      await response.edit({
        embeds: [
          votingEmbed.setDescription(
            `Current votes: **${votesPlaced}/${requiredVotes}**\n` +
            `Voting will end <t:${votingTime}:R>`
          )
        ]
      })
    })

    collector.on('end', async () => {
      const success = votesPlaced >= requiredVotes
      let endReason = collector.endReason

      if (endReason === 'limit') endReason = 'Enough votes collected'
      if (endReason === 'time') endReason = 'Voting time passed'

      const statusEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} -> ${reason}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setDescription(`Voting over: \`${endReason}\`.\nStatus: ${success ? ':white_check_mark: Voting successful!' : ':x: Voting failed!'}`)

      await response.edit({
        embeds: [statusEmbed],
        components: [
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttons.map(btn => btn.setDisabled(true)))
        ]
      })

      if (success) {
        resolve([VoteStatus.Success])
      } else {
        resolve([VoteStatus.Failure])
      }

      // Delete response after 1 min
      await setTimeout(60000)
      await response.delete()
        .catch(() => { })
    })
  })
}

export default CreateVote
