import { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, channelMention, userMention } from "discord.js";
import { Model } from "sequelize";
import { log } from "../Helpers/Logger";
import { chainData, chainSettings } from "../Models";
import Command from "../types/Command";

const MAX_CHANNELS = 15
const MIN_CHANNELS = 1

interface ChainSettings {
  channels: string[]
  captureChance: number
  sendChance: number
  ignoredUsers: string[]
}

export default <Command>{
  permissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('text')
    .setDescription('Configure the text generating bot'),

  async callback({ interaction }) {

    if (!interaction.channel) {
      return interaction.editReply({
        content: 'Please run this command in a text channel in a server.',
        components: []
      })
    }

    const optionsMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('option-select')
          .setOptions(
            {
              label: '⚙️ View config',
              description: 'View the current configuration',
              value: 'viewConfig'
            },
            {
              label: '🧵 Channels',
              description: 'Set what channels the bot should listen to (and reply in)',
              value: 'channels'
            },
            {
              label: '🔢 Capture chance',
              description: 'Set the chance to capture a message',
              value: 'captureChance'
            },
            {
              label: '🔢 Send chance',
              description: 'Set the chance to send a message in a channel',
              value: 'sendChance'
            },
            {
              label: '🚫 Ignored users',
              description: 'Set users that the bot should ignore (message capturing)',
              value: 'bannedUsers'
            }
          )
      )

    const optionSelectRes = await interaction.reply({
      components: [optionsMenu],
      content: 'Select a option to configure for the text generation bot.',
      ephemeral: true
    })

    const awaitOption = await optionSelectRes.awaitMessageComponent({
      componentType: ComponentType.StringSelect
    })

    await awaitOption.deferUpdate()
    const option = awaitOption.values[0]

    const [record] = await chainSettings.findOrCreate({
      where: { guildId: interaction.guildId }
    })

    log.debug(record)

    switch (option) {
      case 'viewConfig': await showConfig(interaction, record); break;
      case 'channels': await setChannels(interaction, record); break;
      case 'sendChance':
      case 'captureChance': await setNumericalValue({ interaction, valueName: option, minValue: 1, maxValue: 100 }); break;
      case 'bannedUsers': await setBannedUsers(interaction, record); break;
    }

    // Reload the record with new data
    await record.reload()

    // Prepares chain data if no is present
    await prepareChainData(interaction, record.getDataValue('channels'))
  }
}

// Gets some data from channels selected as "listening channels"
// if there's no data in the database at all
async function prepareChainData(interaction: ChatInputCommandInteraction, channels: string[]) {
  const [chainRecord] = await chainData.findOrCreate({
    where: { guildId: interaction.guildId },
    defaults: { chainData: [] }
  })

  const data: string[] = chainRecord.getDataValue('chainData')

  if (data.length) return

  log.debug('No chain data present. Generating new data...')
  let msgData: string[] = []

  for (const id of channels) {
    const channel = await interaction.guild?.channels.fetch(id)
      .catch(() => undefined)

    // Typeguard
    if (!channel || channel.type !== ChannelType.GuildText) break;

    log.debug(`Running for channel "${channel.name}"`)

    const messages = await channel.messages.fetch({ limit: 100, cache: false })

    for (const [_, msg] of messages) {
      if (msg.author.bot || msg.content.trim().length < 0) break

      msgData.push(msg.content.trim())
    }
    log.debug('Added new messages')
  }

  log.debug('Updated chain data record. End.')
  await chainRecord.update({
    chainData: msgData
  })
}

// Function used by switch case to set new channels
async function setChannels(
  interaction: ChatInputCommandInteraction,
  record: Model<any, any>
) {
  const currentChannels: string[] = record.getDataValue('channels')

  const channelSelect = new ActionRowBuilder<ChannelSelectMenuBuilder>()
    .addComponents(
      new ChannelSelectMenuBuilder()
        .addChannelTypes(ChannelType.GuildText)
        .setCustomId('channel-select')
        .setMaxValues(MAX_CHANNELS)
        .setMinValues(MIN_CHANNELS)
        .addDefaultChannels(currentChannels)
    )

  const channelSelectRes = await interaction.editReply({
    components: [channelSelect],
    content: 'Select channels which the bot should listen to (and send messages in).' +
      `\nYou must select at least \`${MIN_CHANNELS}\` channel(s) and at most \`${MAX_CHANNELS}\` channels.`
  })

  const awaitChannels = await channelSelectRes.awaitMessageComponent({
    componentType: ComponentType.ChannelSelect
  })

  await awaitChannels.deferUpdate()
  const channels = awaitChannels.values

  await chainSettings.update(
    { channels: channels },
    { where: { guildId: interaction.guildId } }
  )

  interaction.editReply({
    content: `New channels set to ${channels.map(c => channelMention(c)).join(', ')}` +
      '\nThe bot will now start learning from these channels.',
    components: []
  })
}

// Function used by switch case to set numerical values
async function setNumericalValue(args: {
  interaction: ChatInputCommandInteraction
  valueName: 'sendChance' | 'captureChance'
  maxValue: number
  minValue: number
}) {
  const { interaction, valueName, minValue, maxValue } = args

  const valueNameToString = {
    sendChance: 'send chance',
    captureChance: 'capture chance'
  }

  await interaction.editReply({
    content: `Provide a new value for the \`${valueNameToString[valueName]}\` setting.`
      + `\nThis value must be in range \`${minValue}-${maxValue}\``,
    components: []
  })

  const response = await interaction.channel!.awaitMessages({
    // Ignore other users
    filter: (msg) => msg.author.id === interaction.user.id,
    max: 1
  })

  const newChance = response.at(0)?.content
  if (!newChance) return

  const newValue = parseInt(newChance)

  // Out of range or not a number
  if (isNaN(newValue) || newValue > maxValue || newValue < minValue) {
    interaction.editReply({
      content: `The new value must be a number in range \`${minValue}-${maxValue}\`!`
    })
    return
  }

  await chainSettings.update(
    { [valueName]: Number((newValue / 100).toFixed(0)) },
    { where: { guildId: interaction.guildId } }
  )

  await interaction.editReply({
    content: `New \`${valueNameToString[valueName]}\` value set to \`${newValue}%\``
  })
}

async function setBannedUsers(interaction: ChatInputCommandInteraction, record: Model<any, any>) {
  const currentIgnored: string[] = record.getDataValue('ignoredUsers')

  await interaction.editReply({
    content: 'Please provide the IDs (or alternatively @mention users) that the bot should ignore.'
      + '\nSend each id (or @mention) as a new message and type `end` when you\'re done.'
      + `Currently ignored users: ${currentIgnored.map(c => userMention(c)).join(', ')}`
      + '\n\n✅ -> User collected\n⚠️ -> Invalid user ID\n🚫 -> Collector exiting',
    components: []
  })

  const collector = interaction.channel!.createMessageCollector({
    time: 60000,
    filter: (msg) => msg.author.id === interaction.user.id
  })

  let collectedUsers: string[] = []

  collector.on('collect', async (msg) => {
    const content = msg.content.trim()
    const mention = msg.mentions.users.at(0)

    // Stop the collector if the user wants to
    if (content === 'end') {
      msg.react('🚫')
      return collector.stop()
    }

    // Reset the timer otherwise
    collector.resetTimer()

    // Grab the first mentioned user
    if (mention) {
      collectedUsers.push(mention.id)
      msg.react('✅')
      return
    }

    // Check if the user exists
    const isValidUser = await interaction.client.users.fetch(content)
      .catch(() => undefined)

    if (isValidUser) {
      collectedUsers.push(msg.content)
      msg.react('✅')
    } else {
      msg.react('⚠️')
    }
  })

  collector.on('end', async (_) => {
    await interaction.editReply({
      content: `Done. Collected users: ${collectedUsers.map(u => userMention(u)).join(', ')}`
    })

    await chainSettings.update(
      { ignoredUsers: collectedUsers },
      { where: { guildId: interaction.guildId } }
    )
  })
}

async function showConfig(interaction: ChatInputCommandInteraction, record: Model<any, any>) {
  const data: ChainSettings = record.dataValues

  const channels = data.channels.map(c => channelMention(c)).join('\n')
  const ignoredUsers = data.ignoredUsers.map(u => userMention(u)).join('\n')

  const configEmbed = new EmbedBuilder()
    .setAuthor({
      name: `Chatbot configuration • ${interaction.guild?.name}`,
      iconURL: interaction.guild?.iconURL() ?? undefined
    })
    .setFields(
      { name: 'Channels', value: `${channels.length === 0 ? '❌ Nothing here' : channels}`, inline: true },
      { name: 'Ignored users', value: `${ignoredUsers.length === 0 ? '❌ Nothing here' : ignoredUsers}`, inline: true },
      { name: 'Capture chance', value: `\`${data.captureChance}%\`` },
      { name: 'Send chance', value: `\`${data.sendChance}%\``, inline: true },
    )

  interaction.editReply({
    embeds: [configEmbed],
    content: '',
    components: []
  })
}
