import { ActionRowBuilder, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, roleMention, type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js'
import type { Model } from 'sequelize'
import { PlayerSettings, SponsorBlockDb } from '../../Models'
import type { Command } from '../../Types/Command'

const NON_TOGGLE_OPTIONS = ['showConfig', 'djRoleId', 'voteSkipMembers', 'setVoteSkipThreshold', 'sponsorBlockConfig']

interface PlayerSettingsI {
  guildId: string
  requireDjRole: boolean
  djRoleId: string
  voteSkipToggle: boolean
  dynamicNowPlaying: boolean
  resendMessageOnEnd: boolean
  queueEndDisconnect: boolean
  voteSkipThreshold: number
  voteSkipMembers: boolean
}

interface SponsorBlockSettings {
  filler: boolean
  interaction: boolean
  intro: boolean
  music_offtopic: boolean
  outro: boolean
  preview: boolean
  selfpromo: boolean
  sponsor: boolean
}

export const TranslateSponsorBlockNames = {
  filler: 'Filler',
  interaction: 'Interaction',
  intro: 'Intro',
  music_offtopic: 'Non-music part',
  outro: 'Outro',
  preview: 'Preview',
  selfpromo: 'Self-promotion',
  sponsor: 'Sponsored portion'
} as const

const player_config: Command = {
  permissions: {
    user: ['ManageGuild'],
    bot: ['SendMessages', 'AttachFiles']
  },

  data: new SlashCommandBuilder()
    .setName('player-config')
    .setDescription('Configure music player options to your liking')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  helpData: {
    description: 'Shows the current configuration of the player.',
    examples: ['```/player-config```']
  },

  async callback({ interaction }) {
    const optionsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('options-select')
          .setOptions(
            {
              label: "Config",
              description: "Display current player settings.",
              value: "showConfig",
              emoji: "⚙️"
            },
            {
              label: "Sponsor Skip",
              description: "Automatically skip sponsored segments with Sponsorblock.",
              value: "sponsorBlockConfig",
              emoji: "⏭"
            },
            {
              label: "Auto-Leave",
              description: "Automatically leave after queue ends.",
              value: "queueEndDisconnect",
              emoji: "👋"
            },
            {
              label: "Vote Skip",
              description: "Require votes to skip a song.",
              value: "voteSkipToggle",
              emoji: "⏩"
            },
            {
              label: "Resend On End",
              description: "Resend the 'now playing' message for new tracks.",
              value: "resendMessageOnEnd",
              emoji: "↪️"
            },
            {
              label: "Dynamic Now Playing",
              description: "Update 'now playing' message every 15s.",
              value: "dynamicNowPlaying",
              emoji: "🔄"
            },
            {
              label: "DJ Role Required",
              description: "Members need DJ role to use commands.",
              value: "requireDjRole",
              emoji: "❗"
            },
            {
              label: "Set DJ Role",
              description: "Define the DJ role.",
              value: "djRoleId",
              emoji: "✨"
            },
            {
              label: "Vote Skip Members",
              description: "Number of members needed to enable voting.",
              value: "voteSkipMembers",
              emoji: "🔢"
            },
            {
              label: "Vote Skip Threshold",
              description: "Percentage of 'yes' votes required to skip a song.",
              value: "setVoteSkipThreshold",
              emoji: "🔢"
            })
      )

    const res = await interaction.reply({
      components: [optionsMenu],
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: '[ Select an option to change. ]' })
          .setColor('#8b00cc')
      ]
    })

    const collector = res.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    })

    collector.on('collect', async (collected) => {
      if (collected.customId !== 'options-select') return
      await collected.deferUpdate()
      collector.resetTimer()

      const optionName = collected.values[0]
      const optionLabel = collected.component.options.find(c => c.value === optionName)?.label
      const [record] = await PlayerSettings.findOrCreate({
        where: { guildId: interaction.guildId }
      })

      if (!NON_TOGGLE_OPTIONS.includes(optionName)) {
        const toggledOption = !record.getDataValue(optionName)

        await PlayerSettings.update({
          [optionName]: toggledOption
        }, { where: { guildId: interaction.guildId } })

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: `[ ${optionLabel} turned ${toggledOption ? 'on' : 'off'}. ]`})
              .setColor(embedColor)
          ]
        })

        return
      }

      switch (optionName) {
        case 'djRoleId': await setDjRole(interaction); break
        case 'voteSkipMembers': await setVoteSkipMembers(interaction); break
        case 'setVoteSkipThreshold': await setVoteSkipThreshold(interaction); break
        case 'showConfig': await showConfig(interaction, record); break
        case 'sponsorBlockConfig': await sponsorBlockConfig(interaction); break
      }
    })

    collector.on('end', async () => {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: '[ Command timed out. ]'})
            .setColor(embedColor)
        ],
        components: [],
      })
    })
  }
}

async function setDjRole(interaction: ChatInputCommandInteraction) {
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: '[ Mention the new DJ role: ]'})
        .setColor(embedColor)
    ]
  })

  const awaitRole = await interaction.channel?.awaitMessages({
    max: 1,
    time: 60000,
    filter: (msg) => msg.author.id === interaction.user.id
  })

  const message = awaitRole?.at(0)
  if (!message) return

  let correctRole = ''

  const mention = message.mentions.roles.at(0)

  if (mention) {
    correctRole = mention.id
  } else {
    const roleId = message.content.trim().split(' ')[0]

    const isValidRole = await interaction.guild?.roles.fetch(roleId)
      .catch(() => undefined)

    if (!isValidRole) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: '[ This doesn\'t looks like a valid role ID. ]'})
            .setColor(embedColor)
        ]
      })
      return
    }

    correctRole = roleId
  }

  await PlayerSettings.update({
    djRoleId: correctRole
  }, { where: { guildId: interaction.guildId } })

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: `[ New DJ role set to ${roleMention(correctRole)}. ]`})
        .setColor(embedColor)
    ]
  })
}

async function setVoteSkipMembers(interaction: ChatInputCommandInteraction) {
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: '[ Provide the new amount of members for vote skipping: ]'})
        .setColor(embedColor)
    ],
  })

  const awaitAmount = await interaction.channel?.awaitMessages({
    max: 1,
    time: 60000,
    filter: (msg) => msg.author.id === interaction.user.id
  })

  const rawAmount = awaitAmount?.at(0)
  if (!rawAmount) return

  const newAmount = Number(rawAmount.content)

  if (Number.isNaN(newAmount)) {
    
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: '[ Provided value is not a valid number. ]'})
          .setColor(embedColor)
      ]
    })
    return
  }

  await PlayerSettings.update({
    voteSkipMembers: newAmount
  }, { where: { guildId: interaction.guildId } })

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: `[ New amount of members set to ${newAmount}. ]`})
        .setColor(embedColor)
    ]
  })
}

async function setVoteSkipThreshold(interaction: ChatInputCommandInteraction) {
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: '[ Provide the new voting threshold for vote skips: ]'})
        .setColor(embedColor)
    ]
  })

  const awaitAmount = await interaction.channel?.awaitMessages({
    max: 1,
    time: 60000,
    filter: (msg) => msg.author.id === interaction.user.id
  })

  const rawAmount = awaitAmount?.at(0)
  if (!rawAmount) return

  const newAmount = Number(rawAmount.content)

  if (Number.isNaN(newAmount)) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: '[ Provided value is not a valid number. ]'})
          .setColor(embedColor)
      ]
    })
    return
  }

  await PlayerSettings.update({
    voteSkipThreshold: newAmount
  }, { where: { guildId: interaction.guildId } })

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({ name: `[ New vote skip threshold set to ${newAmount}. ]`})
        .setColor(embedColor)
    ]
  })
}

async function showConfig(interaction: ChatInputCommandInteraction, record: Model) {
  const data = record.dataValues as PlayerSettingsI

  const isEnabled = (bool: boolean): string => { return bool ? '✅' : '❌' }

  const configEmbed = new EmbedBuilder()
    .setAuthor({
      name: `Music player configuration • ${interaction.guild?.name}`,
      iconURL: interaction.guild?.iconURL() ?? undefined
    })
    .setDescription(`### DJ role
Enabled: \`${isEnabled(data.requireDjRole)}\`
Role: ${data.djRoleId ? roleMention(data.djRoleId) : 'Not set'}
### Skipvote
Enabled: \`${isEnabled(data.voteSkipToggle)}\`
Required members: \`${data.voteSkipMembers} member(s)\`
Voting threshold: \`${data.voteSkipThreshold}%\`
### Other options
Disconnect on queue end: \`${isEnabled(data.queueEndDisconnect)}\`
Resend message on new track: \`${isEnabled(data.resendMessageOnEnd)}\`
Update now playing message: \`${isEnabled(data.dynamicNowPlaying)}\``)
  .setColor(embedColor)

  await interaction.editReply({
    embeds: [configEmbed]
  })
}

async function sponsorBlockConfig(interaction: ChatInputCommandInteraction) {
  const [record] = await SponsorBlockDb.findOrCreate({
    where: {
      guildId: interaction.guildId
    },
    defaults: {
      filler: false,
      interaction: false,
      intro: false,
      music_offtopic: false,
      outro: false,
      preview: false,
      selfpromo: false,
      sponsor: false
    }
  })

  const sponsorSettingsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('menu')
        .setOptions([
          { label: 'Filler', value: 'filler' },
          { label: 'Interaction', value: 'interaction' },
          { label: 'Intro', value: 'intro' },
          { label: 'Non-music part', value: 'music_offtopic' },
          { label: 'Outro', value: 'outro' },
          { label: 'Preview', value: 'preview' },
          { label: 'Self-promotion', value: 'selfpromo' },
          { label: 'Sponsored portion', value: 'sponsor' },
        ])
    )

  const getSettings = async () => {
    return (await record.reload()).dataValues
  }

  const formatSettings = (settings: SponsorBlockSettings) => {
    const parts: Array<string> = []

    for (const [key, value] of Object.entries(settings)) {
      if (['id', 'createdAt', 'updatedAt', 'guildId'].includes(key)) continue
      parts.push(`**${TranslateSponsorBlockNames[key]}**: \`${(value === 'true' || value === '1') ? '✅' : '❌'}\``)
    }

    return parts.join('\n')
  }

  const constructSettingsEmbed = (settings: SponsorBlockSettings) => {
    return new EmbedBuilder()
      .setAuthor({
        name: `Sponsorblock config • ${interaction.guild?.name}`,
        iconURL: interaction.guild?.iconURL() ?? undefined
      })
      .setDescription(`### Select a option to toggle in the menu below\n${formatSettings(settings)}`)
      .setColor(embedColor)
  }

  const response = await interaction.editReply({
    embeds: [constructSettingsEmbed(await getSettings())],
    content: '',
    components: [sponsorSettingsMenu]
  })

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000
  })

  collector.on('collect', async (int) => {
    await int.deferUpdate()
    collector.resetTimer()

    const updatedSettings = await getSettings()
    const changedValue = updatedSettings[int.values[0]]

    if (process.env.DATABASE_DIALECT === 'sqlite') {
      updatedSettings[int.values[0]] = changedValue === '0' ? '1' : '0'
    } else {
      updatedSettings[int.values[0]] = changedValue === 'true' ? 'false' : 'true'
    }

    await SponsorBlockDb.update(updatedSettings, {
      where: { guildId: int.guildId }
    })

    await interaction.editReply({
      embeds: [constructSettingsEmbed(await getSettings())]
    })
  })
}

export default player_config