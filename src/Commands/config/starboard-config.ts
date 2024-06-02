import { ChannelType, type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, channelLink, channelMention } from 'discord.js'
import type { Command } from '../../Types/Command'
import { type StarboardConfigI, starboardConfig } from '../../Models'

export const ALLOWED_CHANNEL_TYPES = [ChannelType.GuildAnnouncement, ChannelType.GuildText]

const starboard_config: Command<false> = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Everything related to the starboard')
    .addSubcommand(viewConfig => viewConfig
      .setName('view-config')
      .setDescription('Shows the current starboard configuration.')
    )
    .addSubcommand(setChannel => setChannel
      .setName('set-channel')
      .setDescription('Sets the starboard channel.')
      .addChannelOption(channel => channel
        .setName('channel')
        .setDescription('Channel to be set as the starboard channel.')
        .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText)
        .setRequired(true)
      )
    )
    .addSubcommand(setReactions => setReactions
      .setName('set-reactions')
      .setDescription('Sets how many reactions are required to add a message.')
      .addNumberOption(amount => amount
        .setName('amount')
        .setDescription('New amount to be set')
        .setMinValue(1)
        .setRequired(true)
      )
    )
    .addSubcommand(setEmojis => setEmojis
      .setName('set-emojis')
      .setDescription('Sets which emojis are used for the starboard.')
      .addStringOption(emojis => emojis
        .setName('emojis')
        .setDescription('Emojis to be used by the starboard. Separate new emojis with commas (,)')
        .setRequired(true)
      )
    )
    .addSubcommand(setIgnoredChannels => setIgnoredChannels
      .setName('set-ignored-channels')
      .setDescription('Sets which channels the bot should ignore for the starboard.')
      .addStringOption(ignoredChannels => ignoredChannels
        .setName('channels')
        .setDescription('Channels IDs to be ignored.')
        .setRequired(true)
      )
    ),

  permissions: {
    bot: ['SendMessages'],
    user: ['ManageGuild'],
  },

  callback: async ({ interaction, client }) => {
    const [record] = await starboardConfig.findOrCreate({
      where: { guildId: interaction.guild.id },
      defaults: { guildId: interaction.guild.id }
    })

    const data = record.dataValues as StarboardConfigI

    switch (interaction.options.getSubcommand()) {
      case 'view-config': {
        return interaction.reply({
          embeds: [createConfigEmbed(interaction, data)],
          ephemeral: true
        })
      }

      case 'set-channel': {
        const newChannel = interaction.options.getChannel('channel', true)

        // Typeguard
        if (!ALLOWED_CHANNEL_TYPES.includes(newChannel.type)) return

        if (data.boardId === newChannel.id) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setAuthor({ name: '[ Starboard already set to this channel. ]' })
                .setColor(embedColor)
            ],
            ephemeral: true
          })
        }

        const permissions = newChannel.permissionsFor(client.user.id)

        if (!permissions?.has('SendMessages')) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setAuthor({ name: '[ I can\'t send messages in that channel. ]' })
                .setColor(embedColor)
            ],
            ephemeral: true
          })
        }

        data.boardId = newChannel.id

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: '[ New starboard channel set. ]' })
              .setColor(embedColor)
          ],
          ephemeral: true
        })

        break
      }

      case 'set-reactions': {
        const newReactionsAmount = interaction.options.getNumber('amount', true)

        if (data.amount === newReactionsAmount) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setAuthor({ name: '[ Required amount of reactions is already set to this value. ]' })
                .setColor(embedColor)
            ],
            ephemeral: true
          })
        }

        data.amount = newReactionsAmount

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: '[ New reactions amount set. ]' })
              .setColor(embedColor)
          ],
          ephemeral: true
        })

        break
      }

      case 'set-emojis': {
        const newEmojisInput = interaction.options.getString('emojis', true)

        // The reason we put a new Set here is to remove duplicates
        const newEmojis = [...new Set(
          newEmojisInput
            .split(', ')
            .map(emoji => emoji.trim())
            .filter(emoji => emoji.match(/(<a?)?:\w+:(\d{18}>)?|\p{Extended_Pictographic}/gu)))
        ]

        data.emojis = newEmojis.join(' ')

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: '[ New emojis set. ]' })
              .setColor(embedColor)
          ],
          ephemeral: true
        })

        break
      }

      case 'set-ignored-channels': {
        const newIgnoredChannelsInput = interaction.options.getString('channels', true)
        const newIgnoredChannels = newIgnoredChannelsInput
          .split(', ')
          .map(c => c.trim())

        const channels = await interaction.guild.channels.fetch()

        for (const channel of newIgnoredChannels) {
          if (!channels.find(c => c?.id === channel)) {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setAuthor({ name: `[ "${channel}" doesn't seem to be valid. ]`})
                  .setColor(embedColor)
              ],
              ephemeral: true
            })
          }
        }

        data.bannedChannels = newIgnoredChannels.join(' ')

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({ name: '[ Ignored channels set. ]'})
              .setColor(embedColor)
          ],
          ephemeral: true
        })

        break
      }
    }

    await starboardConfig.update(data, {
      where: { guildId: interaction.guild.id }
    })

    interaction.followUp({
      embeds: [createConfigEmbed(interaction, data)],
      ephemeral: true
    })
  }
}

export default starboard_config

function createConfigEmbed(interaction: ChatInputCommandInteraction<'cached'>, data: StarboardConfigI): EmbedBuilder {
  const bannedChannels = data.bannedChannels === '' ? [] : data.bannedChannels.split(' ')

  return new EmbedBuilder()
    .setAuthor({
      name: `Starboard config for ${interaction.guild.name}`,
      iconURL: interaction.guild.iconURL() ?? undefined
    })
    .setDescription(data.boardId ? null : '### Configuration invalid - Channel not set.')
    .setFields(
      { name: '🧵 Channel⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀', value: data.boardId ? channelLink(data.boardId) : '`Not set`', inline: true },
      { name: '🔢 Reactions amount⠀⠀', value: `\`${data.amount} reaction${data.amount > 1 ? 's' : ''}\``, inline: true },
      { name: '🤗 Emojis⠀⠀⠀⠀⠀⠀', value: data.emojis.replace(/ /g, ', ') ?? '`Not set`', inline: true },
      { name: '❌ Ignored channels', value: bannedChannels.length ? bannedChannels.map(c => channelMention(c)).join(', ') : '`Not set`' } // Formatting sucks
    )
    .setColor(data.boardId ? embedColor : 'Red')
}