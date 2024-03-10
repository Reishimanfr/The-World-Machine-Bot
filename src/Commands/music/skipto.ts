import { EmbedBuilder, SlashCommandBuilder, TextChannel, type ApplicationCommandOptionChoiceData } from 'discord.js'
import type Queue from 'poru/dist/src/guild/Queue'
import { client } from '../..'
import { embedColor } from '../../Helpers/Util'
import { logger } from '../../Helpers/Logger'
import { Command } from '../../Types/Command'
import CreateVote, { VoteStatus } from '../../Helpers/CreateVote'
import { Track } from 'poru'

const skipTo: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect', 'SendMessages'],
    bot: ['Speak', 'Connect', 'SendMessages']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Skip to a specified song in the queue')
    .addNumberOption(pos => pos
      .setName('position')
      .setDescription('Position in the queue to skip to')
      .setRequired(true)
      .setAutocomplete(true)
      .setMinValue(1)
    ),

  helpData: {
    description: 'Skips to a specified song in the queue. If there\'s enough members **(configurable)** in the voice channel a voting will take place where users choose if they want to skip the song or not.\n**This command will only show the next 25 songs from the queue, but you can still input a number bigger than that!**',
    examples: [
      `> **Skip to the 3rd song in the queue**
      \`\`\`/skipto
      position: 3\`\`\``,

      `> **Skip to the 25th song in the queue**
      \`\`\`/skipto
      position: 25\`\`\``
    ]
  },

  callback: async ({ interaction, player }) => {
    const position = interaction.options.getNumber('position', true)

    // This means autocomplete was used with a invalid value since pos can't be less than 1
    // If it's sent as a command (thanks discord!)
    if (position === -1) return

    if (!player.queue.at(position - 1)) {
      return await interaction.reply({
        content: 'There isn\'t a song in the position you specified.',
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

    const nonBotMembers = member.voice.channel.members.filter(m => !m.user.bot).size
    const requiredVotes = Math.round(nonBotMembers * (player.settings.voteSkipThreshold / 100))

    if (requiredVotes > 1) {
      if (player.votingActive) {
        return await interaction.reply({
          content: 'There\'s a voting in progress already!',
          ephemeral: true
        })
      }

      await interaction.reply({
        content: 'Waiting for members to place their votes...',
        ephemeral: true
      })

      const song = player.queue.at(position - 1) as Track

      player.votingActive = true

      const [status, error] = await CreateVote({
        interaction,
        reason: `Wants to skip to song "${song.info.title}"`,
        requiredVotes,
        voiceText: interaction.channel as TextChannel,
        voiceChannel: member.voice.channel,
        time: 60000
      })

      player.votingActive = false

      switch (status) {
        case VoteStatus.Success: {
          interaction.editReply(`Skipped to song **${song.info.title}**.`)
          player.queue = player.queue.slice(position - 1, player.queue.length) as Queue
          player.stop()
          break
        }

        case VoteStatus.Failure: {
          interaction.editReply('Other members didn\'t agree to skip to this song.')
          break
        }

        case VoteStatus.Error: {
          logger.error(`Failed to finish skipto voting: ${error?.stack}`)
          interaction.editReply(`Voting failed with a error: \`\`\`${error?.message}\`\`\``)
          break
        }
      }
    } else {
      player.queue = player.queue.slice(position - 1, player.queue.length) as Queue
      player.stop()

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`[ Skipped to song **${player.queue.at(0)!.info.title}**. ]`)
            .setColor(embedColor)
        ],
        ephemeral: true
      })
    }
  },

  autocomplete: async (interaction) => {
    if (!interaction.guild) return

    const player = client.poru.players.get(interaction.guild.id)
    const queue = player?.queue

    const member = await interaction.guild.members.fetch(interaction.user.id)

    if (!member.voice.channel?.id) {
      await interaction.respond([
        {
          name: '❌ You must be in a voice channel to use this.',
          value: -1
        }
      ]); return
    }

    if (member.voice.channel.id !== player?.voiceChannel) {
      await interaction.respond([
        {
          name: '❌ You must be in the same voice channel to use this.',
          value: -1
        }
      ]); return
    }

    if (!queue?.length) {
      await interaction.respond([
        {
          name: '❌ There are no songs in the queue to skip to.',
          value: -1
        }
      ]); return
    }

    const response: ApplicationCommandOptionChoiceData[] = []

    for (let i = 0; i < queue.length; i++) {
      if (i >= 25) break // Discord limits autocomplete to 25 options
      const part = queue[i]

      response.push({
        name: `${part.info.title} - ${part.info.author}`,
        value: i + 1
      })
    }

    await interaction.respond(response)
  }
}

export default skipTo
