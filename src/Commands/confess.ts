import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { Command } from '../Types/Command'
import { Confessions, ConfessionsI } from '../Models/Confessions'

enum SubcommandResult {
  ERROR,
  SUCCESS,
  UNDEFINED_MEMBER_ERROR,
  INSUFFICIENT_PERMISSIONS
}

const confess: Command<false> = {
  data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Confess about something anonymously (unless you get enough reactions under the message!).')
    .addSubcommand(conf => conf
      .setName('configure')
      .setDescription('Configure the confessions command.')
      .addChannelOption(channel => channel
        .setName('channel')
        .setDescription('Channel to which confessions will be sent.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread)
      )
      .addNumberOption(amount => amount
        .setName('amount')
        .setDescription('Amount of reactions required to reveal the confession\'s author.')
        .setMinValue(1)
      )
      .addStringOption(emoji => emoji
        .setName('emoji')
        .setDescription('Emoji to be used to reveal the confession\'s author.')
      )
    )
    .addSubcommand(send => send
      .setName('send')
      .setDescription('Send a confession.')
      .addStringOption(confession => confession
        .setName('message')
        .setDescription('The confession you want to send.')
        .setRequired(true)
        .setMaxLength(1800)
      )
    )
    .addSubcommand(reveal => reveal
      .setName('reveal')
      .setDescription('Reveals a confession. Admin only.')
      .addStringOption(confession => confession
        .setName('id')
        .setDescription('Message ID of the confession you want to reveal.')
        .setRequired(true)
    )
  ),

  disabled: true,

  permissions: {
    bot: ['SendMessages'],
    user: ['SendMessages']
  },

  callback: async ({ interaction, client }) => {
    if (!interaction.inCachedGuild()) return

    switch (interaction.options.getSubcommand(true)) {
      case 'configure': await configure(interaction); break;
    }
  }
}

async function configure(interaction: ChatInputCommandInteraction<'cached'>) {
  const member = await interaction.guild?.members.fetch(interaction.user.id)

  if (!member) return // Typeguard

  if (!member.permissions.has('ManageGuild')) {
    return interaction.reply({
      content: '`❌` - Insufficient permissions. (This subcommand requires the `ManageGuild` permission.)',
      ephemeral: true
    })
  }
  
  const [record] = await Confessions.findOrCreate({
    where: { guildId: interaction.guild.id },
    defaults: { guildId: interaction.guild.id }
  })

  const settings: ConfessionsI = record.dataValues
  
  const newEmoji = interaction.options.getString('emoji')
    ?.trim()
    ?.match(/\p{Emoji}|<(a|):(.*):(.*?)>/gu)
  const newAmount = interaction.options.getNumber('amount')
  const newChannel = interaction.options.getChannel('channel')

  const newSettings: ConfessionsI = {
    guildId: interaction.guild.id,
    amount: newAmount ?? settings.amount,
    channelId: newChannel?.id ?? settings.channelId,
    emoji: newEmoji ? interaction.options.getString('emoji', true).trim() : settings.emoji
  }

  const newConfig = new EmbedBuilder()
    .setAuthor({
      name: newSettings.channelId ? '✅ Configuration saved.' : '❌ Configuration discarded - channel not set.',
      iconURL: interaction.guild.iconURL() ?? undefined
    })
    .setFields(
      { name: '🧵 Channel⠀⠀⠀⠀⠀', value: `${newSettings.channelId ? `<#${newSettings.channelId}>` : '`Not set`'}`, inline: true },
      { name: '🤗 Emoji⠀⠀⠀⠀⠀⠀⠀', value: `${newSettings.emoji}`, inline: true },
      { name: '🔢 Amount⠀⠀⠀⠀⠀⠀', value: `${newSettings.amount} reactions`, inline: true }
    )
    .setColor(newSettings.channelId ? 'Green' : 'Red')

  await Confessions.update(newSettings, {
    where: { guildId: interaction.guild.id }
  })

  interaction.reply({
    embeds: [newConfig],
    ephemeral: true
  })
}

export default confess