import { Events, Interaction, InteractionType, AutocompleteInteraction, ButtonInteraction, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'
import { Event } from '../../Types/Event'
import { logger } from '../../Helpers/Logger'
import { client } from '../..'
import { ExtPlayer, } from '../../Helpers/ExtendedPlayer'
import { embedColor } from '../../Helpers/Util'
import { loop } from './Buttons/loop'
import { save } from './Buttons/save'
import { showQueue } from './Buttons/showQueue'
import { skip } from './Buttons/skip'
import { togglePlayback } from './Buttons/togglePlayback'
import { combineConfig } from '../../Funcs/CombinePlayerConfig'
import { serverStats } from '../../Models'

const InteractionMap = {
  [InteractionType.ApplicationCommandAutocomplete]: Autocomplete,
  [InteractionType.ApplicationCommand]: CommandInteraction,
  [InteractionType.MessageComponent]: Button
}

const InteractionCreate: Event = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: Interaction) => {
    const [record] = await serverStats.findOrCreate({
      where: { guildId: interaction.guildId },
      defaults: { guildId: interaction.guildId, lastActive: new Date() }
    })

    record.update({ lastActive: new Date() })

    const handler = InteractionMap[interaction.type]

    if (!handler) {
      logger.warn(`Unhandled interaction type: ${interaction.type}`)
      return
    }

    try {
      await handler(interaction)
    } catch (error) {
      logger.error(`Interaction failed with error: ${error.stack}`)
    }
  }
}

async function Autocomplete(interaction: AutocompleteInteraction) {
  const cmd = client.commands.get(interaction.commandName)

  if (cmd?.autocomplete) {
    try {
      cmd.autocomplete(interaction)
    } catch (error) {
      logger.error(`Autocomplete interaction for command "${interaction.commandName}" failed: ${error}`)
    }
  }
}

async function Button(interaction: ButtonInteraction) {
  if (!interaction.guild || !interaction.customId.startsWith('songcontrol')) return

  const buttonMap = {
    showQueue,
    togglePlayback,
    skip,
    loop,
    save
  }

  const player = client.poru.players.get(interaction.guild.id) as ExtPlayer | undefined
  const member = await interaction.guild.members.fetch(interaction.user.id)

  if (!player) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ This player isn\'t active anymore. ]')
          .setColor(embedColor)
      ],
      ephemeral: true
    })
  }

  if (!member.voice.channel) {
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ You must be in a voice channel to use this. ]')
          .setColor(embedColor)
      ],
      ephemeral: true
    })
  }

  if (member.voice.channelId !== interaction.guild.members.me?.voice.channelId) {
    return await interaction.reply({
      content: 'You must be in the same voice channel to use this.',
      ephemeral: true
    })
  }

  const action = interaction.customId.split('-')[1]
  const handler = buttonMap[action]

  const args = {
    interaction,
    player,
    client
  }

  // Shouldn't happen
  if (!player.isPlaying && !player.isPaused) {
    return await interaction.reply({
      content: 'Nothing is playing right now.',
      ephemeral: true
    })
  }

  try {
    await handler(args)
  } catch (error) {
    logger.error(`Failed to process button ${interaction.customId}: ${error}`)
  }
}

async function CommandInteraction(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return
  const cmd = client.commands.get(interaction.commandName)

  if (!cmd) {
    logger.warn(`File for command ${interaction.commandName} doesn't exist!`)
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ This command doesn\'t exist. ]')
          .setColor(embedColor)
      ],
      ephemeral: true
    })
  }

  // Missing permissions check
  if (cmd.permissions.user) {
    const userPermissions = interaction.memberPermissions
    const requiredPermissions = cmd.permissions.user
    const missingPermissions = requiredPermissions.filter(permission => !userPermissions?.has(permission))

    if (missingPermissions.length > 0) {
      return interaction.reply({
        content: `You are missing the following permissions which are required to use this command: \`\`\`${missingPermissions.join(', ')}\`\`\``,
      })
    }
  }

  if (cmd.permissions.bot) {
    const botPermissions = interaction.guild.members.me?.permissions
    const requiredPermissions = cmd.permissions.bot
    const missingPermissions = requiredPermissions.filter(
      permission => !botPermissions?.has(permission)
    )

    if (missingPermissions.length > 0) {
      return interaction.reply({
        content: `I am missing the following permissions which are required to use this command: \`\`\`${missingPermissions.join(', ')}\`\`\``,
      })
    }
  }

  let player = client.poru.players.get(interaction.guild.id) as ExtPlayer

  // Case for music commands
  if (cmd.musicOptions) {
    const options = cmd.musicOptions

    const config = await combineConfig(interaction.guild.id)
    const member = await interaction.guild.members.fetch(interaction.user.id)

    // Member is not in voice channel
    if (options.requiresVc && !member?.voice.channel?.id) {
      return await interaction.reply({
        content: 'You must be in a voice channel to use this command.',
        ephemeral: true
      })
    }

    // Member is not in the same voice channel as bot
    if (options.requiresVc && player && member?.voice.channel?.id !== player?.voiceChannel) {
      return await interaction.reply({
        content: 'You must be in the same voice channel as me to use this command.',
        ephemeral: true
      })
    }

    if (options.requiresPlaying && (!player?.isPlaying)) {
      return await interaction.reply({
        content: 'You can\'t use this command while nothing is playing.',
        ephemeral: true
      })
    }

    // Member doesn't have the DJ role
    if (options.requiresDjRole && config.requireDjRole && !member?.roles.cache.find(role => role.id === config.djRoleId) && config.djRoleId) {
      return await interaction.reply({
        content: `You must have the <@&${config.djRoleId}> role to use this command.`,
        ephemeral: true
      })
    }

    if (!player) {
      player = client.poru.createConnection({
        guildId: interaction.guild.id,
        voiceChannel: member.voice.channel!.id,
        textChannel: interaction.channel!.id,
        deaf: true,
        mute: false
      }) as ExtPlayer
    }
  }

  const args = {
    interaction,
    client,
    player
  }

  await cmd.callback(args)
}

export default InteractionCreate
