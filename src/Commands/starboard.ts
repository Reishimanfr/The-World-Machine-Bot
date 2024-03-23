import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js'
import { starboardConfig } from '../Models'
import { Command } from '../Types/Command'
import { Model } from 'sequelize'
import { embedColor } from '../Helpers/Util'

const confirmButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId('accept')
    .setLabel('✏️ Let\'s change this')
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId('deny')
    .setLabel('❌ I\'ve changed my mind')
    .setStyle(ButtonStyle.Secondary),
)

const finalConButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId('accept')
    .setLabel('✅ Looks good!')
    .setStyle(ButtonStyle.Success),

  new ButtonBuilder()
    .setCustomId('deny')
    .setLabel('❌ Let\'s go back')
    .setStyle(ButtonStyle.Secondary),
)

async function amountCon(
  interaction: CommandInteraction,
  record: Model<any, any>
) {
  const oldAmount = record.getDataValue('amount')

  const embeds = [
    new EmbedBuilder()
      .setDescription(`[ The current amount of required emojis is set to **${oldAmount}**. ]`)
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ Sure! The amount will stay the same. ]')
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ Input the new amount of required reactions here... ]')
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ The amount must be a number! ]')
      .setColor(embedColor),
  ]

  const res = await interaction.editReply({
    embeds: [embeds[0]],
    components: [menu, confirmButtons],
  })

  const collector = await res.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000,
  })

  await collector.deferUpdate()
  const value = collector.customId

  if (value == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    })
  }

  await interaction.editReply({
    embeds: [embeds[2]],
    components: [],
  })

  const sel = await interaction.channel?.awaitMessages({
    max: 1,
    time: 60000,
    filter: (u) => u.author.id === interaction.user.id, // Only accept messages from the command initiator
  })

  const content = sel?.at(0)?.content

  if (!content) return

  const parseAmount = parseInt(content)

  // Amount input is not valid number
  if (isNaN(parseAmount)) {
    return interaction.editReply({
      embeds: [embeds[3]],
    })
  }

  if (parseAmount < 0) {
    return interaction.editReply({
      content: 'The value can\'t be less than 0!',
      embeds: []
    })
  }

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `[ Done! The new amount has been set to **${parseAmount}**. ]`
        )
        .setColor(embedColor),
    ],
    components: [menu],
  })

  await starboardConfig.update(
    {
      amount: parseAmount,
    },
    { where: { guildId: interaction.guildId } }
  )
}

async function blChannelCon(interaction: CommandInteraction) {
  const record = await starboardConfig.findOne({ where: { guildId: interaction.guildId } })
  const blacklistedChannels = record?.getDataValue('bannedChannels').split(' ')

  const embeds = [
    new EmbedBuilder()
      .setDescription(
        blacklistedChannels.length > 0
          ? `[ The current blacklisted channels are: ${blacklistedChannels
            .map((c) => `<#${c.getDataValue('channelId')}>`)
            .join(', ')}]`
          : '[ Blacklisted channels haven\'t been setup yet. ]'
      )
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ Sure! The channel list will stay the same. ]')
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription(
        '[ Select channels to be blacklisted in the menu below. ]'
      )
      .setColor(embedColor),
  ]

  const res = await interaction.editReply({
    embeds: [embeds[0]],
    components: [menu, confirmButtons],
  })

  const collector = await res.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000,
  })

  await collector.deferUpdate()
  const value = collector.customId

  if (value == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    })
  }

  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId('chSelect')
    .setPlaceholder('Select channels to be blacklisted')
    .setMaxValues(interaction.guild?.channels.cache.size ?? 0)

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    channelSelect
  )

  const chSelectRes = await interaction.editReply({
    embeds: [embeds[2]],
    components: [row],
  })

  const chCollect = await chSelectRes.awaitMessageComponent({
    componentType: ComponentType.ChannelSelect,
    time: 60000,
  })

  await chCollect.deferUpdate()
  const channels = chCollect.values

  const finalCon = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `[ The new channel blacklist will be ${channels
            .map((c) => `<#${c}>`)
            .join(', ')}. Confirm? ]`
        )
        .setColor(embedColor),
    ],
    components: [finalConButtons],
  })

  const finalCollected = await finalCon.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 6000,
  })

  await finalCollected.deferUpdate()
  const finalBtn = finalCollected.customId

  if (finalBtn == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    })
  }

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `[ Done! The new channel blacklist has been set to ${channels
            .map((c) => `<#${c}>`)
            .join(', ')}. ]`
        )
        .setColor(embedColor),
    ],
    components: [menu],
  })

  await starboardConfig.update({
    bannedChannels: channels.join(' ')
  }, { where: { guildId: interaction.guildId } })
}

async function channelCon(
  interaction: CommandInteraction,
  record: Model<any, any>
) {
  const oldChannel = record.getDataValue('boardId')

  const embeds = [
    new EmbedBuilder()
      .setDescription(`[ The current channel ${oldChannel ? `is set to <#${oldChannel}>` : 'hasn\'t been set up yet'}. ]`)
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ Sure! The channel will stay the same. ]')
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ Select a new channel in the menu below. ]')
      .setColor(embedColor),
  ]

  const res = await interaction.editReply({
    embeds: [embeds[0]],
    components: [menu, confirmButtons],
  })

  const collector = await res.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000,
  })

  await collector.deferUpdate()
  const value = collector.customId

  if (value == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    })
  }

  const channelSelect = new ChannelSelectMenuBuilder()
    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setCustomId('chSelect')
    .setPlaceholder('Select a channel!')

  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    channelSelect
  )

  const chSelectRes = await interaction.editReply({
    embeds: [embeds[2]],
    components: [row],
  })

  const chCollect = await chSelectRes.awaitMessageComponent({
    componentType: ComponentType.ChannelSelect,
    time: 60000,
  })

  await chCollect.deferUpdate()
  const channel = chCollect.values[0]

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `[ Done! The new channel has been set to <#${channel}>. ]`
        )
        .setColor(embedColor),
    ],
    components: [menu],
  })

  await starboardConfig.update(
    {
      boardId: channel,
    },
    { where: { guildId: interaction.guildId } }
  )
}

async function emojiCon(interaction: CommandInteraction) {
  const record = await starboardConfig.findOne({
    where: { guildId: interaction.guildId }
  })

  const emojis = record?.getDataValue('emojis').split(' ')

  const embeds = [
    new EmbedBuilder()
      .setDescription(`[ The current emojis are set to ${emojis.join(', ')}. ]`)
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ Sure! The emojis will stay the same. ]')
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ Input the new emojis separated by (,) here... ]')
      .setColor(embedColor),

    new EmbedBuilder()
      .setDescription('[ The amount must be a number! ]')
      .setColor(embedColor),
  ]

  const res = await interaction.editReply({
    embeds: [embeds[0]],
    components: [menu, confirmButtons],
  })

  const collector = await res.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000,
  })

  await collector.deferUpdate()
  const value = collector.customId

  if (value == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    })
  }

  await interaction.editReply({
    embeds: [embeds[2]],
    components: [],
  })

  const sel = await interaction.channel?.awaitMessages({
    max: 1,
    time: 180000,
    filter: (u) => u.author.id === interaction.user.id,
  })

  const content = sel?.at(0)?.content

  if (!content) return

  const newEmojis = content
    .split(',')
    .map((emj) => emj.trim())
    .filter(emj => emj.match(/\p{Emoji}/gu) ?? emj.match(/<(a|):(.*):(.*?)>/gu))

  console.log(newEmojis)

  const finalCon = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ The new emojis will be set to ${newEmojis.join(', ')}. Confirm? ]`)
        .setColor(embedColor),
    ],
    components: [finalConButtons],
  })

  const finalCollected = await finalCon.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 6000,
  })

  await finalCollected.deferUpdate()
  const finalBtn = finalCollected.customId

  if (finalBtn == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    })
  }

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ Done! The new emojis have been set to **${newEmojis.join(', ')}**. ]`)
        .setColor(embedColor),
    ],
    components: [menu],
  })

  await starboardConfig.update({
    emojis: newEmojis.join(' ')
  }, { where: { guildId: interaction.guildId } })
}

const funcMap = {
  emojiCon,
  channelCon,
  amountCon,
  blChannelCon
}

export const menu = new ActionRowBuilder<StringSelectMenuBuilder>()
  .addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('conSelect')
      .setPlaceholder('Select a option to configure!')
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('⭐ Emojis')
          .setDescription('Configure which emojis are accepted for the starboard.')
          .setValue('emojiCon'),

        new StringSelectMenuOptionBuilder()
          .setLabel('🧵 Channel')
          .setDescription('Set where the starboard channel should be.')
          .setValue('channelCon'),

        new StringSelectMenuOptionBuilder()
          .setLabel('🔢 Amount')
          .setDescription('Configure how many reaction are required to send a message.')
          .setValue('amountCon'),

        new StringSelectMenuOptionBuilder()
          .setLabel('❌ Blacklisted channels')
          .setDescription('Configure which channels should be ignored.')
          .setValue('blChannelCon')
      )
  )

const starboard: Command = {
  permissions: {
    user: ['ManageGuild'],
    bot: ['SendMessages', 'AttachFiles']
  },

  data: new SlashCommandBuilder()
    .setName('starboard-config')
    .setDescription('Configure the starboard to your liking')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  helpData: {
    description: 'Shows the current configuration of the starboard and allows you to change it.\n### Note:\nThe starboard feature was covered more in-depth in the [github repository](https://github.com/rei-shi/The-World-Machine).',
    image: 'https://cdn.discordapp.com/attachments/1169390259411369994/1175086512958873600/Discord_bx7OlzKNHT.png',
    examples: ['```/starboard-config```']
  },

  callback: async ({ interaction }) => {
    const res = await interaction.reply({
      components: [menu],
      ephemeral: true
    })

    const collector = res.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    })

    collector.on('collect', async (collected) => {
      await collected.deferUpdate()
      collector.resetTimer()

      const option = collected.values[0]
      const [record] = await starboardConfig.findOrCreate({
        where: { guildId: interaction.guildId },
        defaults: { guildId: interaction.guildId, boardId: null, amount: 4 }
      })

      const args = [interaction, record]
      const handler = funcMap[option]

      await handler(...args)
    })
  }
}

export default starboard
