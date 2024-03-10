import axios from 'axios'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  EmbedField,
  GuildEmoji,
  MessageReaction,
  PartialMessageReaction,
  ReactionEmoji
} from 'discord.js'
import { clipString } from '../Funcs/ClipString'
import { starboardConfig, starboardEntries } from '../Models'
import { logger } from './Logger'
import { client } from '..'

type ReactionOrPart = MessageReaction | PartialMessageReaction;

interface ConfigOptions {
  boardId: string,
  amount: number,
  emojis: string
  bannedChannels: string
}

const AcceptedImages = ['image/gif', 'image/jpeg', 'image/png', 'image/webp']
const AcceptedLinkHeaders = ['https://cdn.discordapp.com/attachments', 'https://media.discordapp.net/attachments']

export class StarboardHelper {
  private reaction: ReactionOrPart

  constructor(reaction: ReactionOrPart) {
    this.reaction = reaction
  }

  /**
   * Formats the reaction emoji into a escaped sequence
   */
  private formatReactionString(
    reactionEmoji: ReactionEmoji | GuildEmoji
  ): string {
    let formattedEmoji = reactionEmoji.animated ? '<a:' : '<:'
    
    formattedEmoji += reactionEmoji.id
      ? `${reactionEmoji.name}:${reactionEmoji.id}>`
      : this.reaction.emoji.name ?? 'Error!'

    return formattedEmoji
  }

  private async setImage(reaction: MessageReaction): Promise<string | null> {
    const content = reaction.message.content?.trim()
    const attachment = reaction.message.attachments?.at(0)

    if (attachment && AcceptedImages.includes(attachment.contentType ?? '')) {
      return attachment.url
    }

    if (!content?.length) return null

    const splitContent = content?.split(' ')
    const links: string[] = []

    splitContent?.forEach((part) => {
      AcceptedLinkHeaders.forEach((header) => {
        if (part.startsWith(header)) links.push(part)
      })
    })

    if (!links.length) return null

    for (const link of links) {
      const isImage = await this.checkIfValidImage(link)

      if (isImage) {
        return link
      }
    }

    return null
  }

  /**
   * Checks if a link has a content-type header that's a accepted image MIME
   */
  private async checkIfValidImage(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url)

      if (response.status >= 200 && response.status < 300) {
        const contentType = response.headers['content-type']
        if (contentType && AcceptedImages.includes(contentType)) {
          return true
        }
      }

      return false
    } catch (error) {
      logger.error(`Error checking URL ${url}: ${error}`)
      return false
    }
  }

  private async setFields(): Promise<EmbedField[]> {
    const message = this.reaction.message

    const fields: EmbedField[] = []

    if (
      message.content ||
      message.embeds[0]?.data?.description ||
      message.attachments.size
    ) {
      const embed = message.embeds[0] ?? null
      let contentString = ''

      const hasValidHeader: boolean[] = []

      AcceptedLinkHeaders.forEach((header) =>
        hasValidHeader.push(message.content?.startsWith(header) ?? false)
      )

      const messageIsLinkOnly =
        message.content &&
        message.content?.split(' ').length == 1 &&
        hasValidHeader.some((value) => value)

      if (messageIsLinkOnly) {
        const split = message.content?.split('?')[0].split('/')

        fields.push({
          name: '📄 Message:',
          value: `[${split?.pop()}](${message.content})`,
          inline: false,
        })

        return fields
      }

      if (message.content) {
        contentString += message.content
      } else if (embed?.data?.description) {
        contentString += embed?.data?.description
      } else if (message.attachments.size) {
        contentString = `=Message contains attachments (${message.attachments.size})=`
      } else {
        contentString = '⚠️ Failed to fetch message content TwT'
      }

      fields.push({
        name: '📄 Message:',
        value: clipString({ string: contentString, maxLength: 500, sliceEnd: '...' }),
        inline: false,
      })
    }

    if (message.reference) {
      const reference = await message.fetchReference()
      const refEmbed = reference.embeds[0] ?? null
      let referenceString = ''

      if (reference.content) {
        referenceString += ` ${reference.content}`
      } else if (refEmbed?.data?.description) {
        referenceString += refEmbed?.data?.description
      } else if (reference.attachments.size) {
        referenceString = ` =Message contains attachments (${reference.attachments.size})=`
      } else {
        referenceString = '⚠️ Failed to fetch message reference TwT'
      }

      fields.push({
        name: '↩️ Replying to:',
        value: clipString({ string: referenceString, maxLength: 500, sliceEnd: '...' }),
        inline: false,
      })
    }

    return fields
  }

  public async main(): Promise<unknown> {
    // Fetch the reaction if it's partial
    const reaction = this.reaction.partial
      ? await this.reaction.fetch()
      : this.reaction

    const record = await starboardConfig.findOne({
      where: { guildId: reaction.message.guildId }
    })

    // Something went wrong so we can't continue
    if (!record) return

    const config: ConfigOptions = record.dataValues

    if (!config?.boardId) return // There is no config or configured channel
    if (config.bannedChannels.split(' ').includes(reaction.message.channelId)) return // The channel is blacklisted
    if (reaction.message.channelId === config.boardId) return // The reaction channel is the same as starboard channel

    const reactionEmoji = this.formatReactionString(reaction.emoji)

    if (!config.emojis.split(' ').includes(reactionEmoji)) return // The emoji isn't accepted for the starboard

    const reactions: { emoji: string; count: number }[] = []

    reaction.message.reactions.cache.forEach((rect) => {
      let emojiName = rect.emoji.name

      if (rect.emoji.id) {
        emojiName = `<${rect.emoji.animated ? 'a' : ''}:${rect.emoji.name}:${rect.emoji.id}>`
      }

      if (emojiName && config.emojis.split(' ').includes(emojiName)) {
        reactions.push({ emoji: emojiName, count: rect.count })
      }
    })

    reactions.sort((a, b) => b.count - a.count)

    // None of the reactions are equal or more than config amount
    if (!reactions.some((rect) => rect.count >= config.amount)) return

    // Format the emojis: {emoji} * {emoji}...
    const reactionStrings: string[] = reactions.map(r => `${r.emoji}: ${r.count}`)

    const boardChannel = await reaction.message.guild?.channels.fetch(config.boardId)

    if (!boardChannel) return
    if (boardChannel.type !== ChannelType.GuildAnnouncement && boardChannel.type !== ChannelType.GuildText) return

    const dbEntry = await starboardEntries.findOne({ where: { starredMessageUrl: reaction.message.url } })

    const messageDataSplit = await dbEntry?.getDataValue('botMessageUrl').split('/')
    const messageId = messageDataSplit?.length ? messageDataSplit[messageDataSplit?.length - 1] : null
    const entryMessage = messageId ? (await boardChannel.messages.fetch(messageId) ?? null) : null

    if (!entryMessage) {
      const [member, count, fields, embedImage] = await Promise.all([
        reaction.message.guild?.members.fetch(reaction.message.author!.id),
        starboardEntries.count({
          where: { guildId: reaction.message.guildId },
        }),
        this.setFields(),
        this.setImage(reaction),
      ])

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `Entry #${count == 0 ? 1 : count}`,
          iconURL: reaction.message.guild?.iconURL() ?? undefined,
        })
        .setColor(member?.displayHexColor ?? null)
        .setThumbnail(member?.displayAvatarURL({ extension: 'png' }) ?? null)
        .setDescription(reactionStrings.join(' • '))
        .addFields(fields)
        .setImage(embedImage)
        .setTimestamp()

      const buttons: Array<ButtonBuilder> = [
        new ButtonBuilder()
          .setLabel('Jump to message')
          .setStyle(ButtonStyle.Link)
          .setURL(reaction.message.url)
      ]

      const refButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(buttons)

      try {
        const permissions = boardChannel.permissionsFor(client.user!.id)

        if (!permissions?.has('SendMessages')) {
          reaction.message.reply(`⚠️ I can't send messages in <#${config.boardId}> TwT`)
          return
        }

        const res = await boardChannel.send({
          embeds: [embed],
          components: [refButton],
        })

        if (boardChannel.type === ChannelType.GuildAnnouncement) {
          await boardChannel.messages.crosspost(res)
        }

        const data = {
          guildId: reaction.message.guild?.id,
          botMessageUrl: res.url,
          starredMessageUrl: reaction.message.url
        }

        await starboardEntries.create(data)

      } catch (error) {
        logger.error(`Failed to send starboard message: ${error.stack}`)
      }
    } else if (entryMessage) {
      const embed = EmbedBuilder.from(entryMessage.embeds.at(0)!)
        .setDescription(reactionStrings.join(' • '))

      try {
        await entryMessage.edit({ embeds: [embed] })
      } catch (error) {
        logger.error(`Failed to update starboard message: ${error.stack}`)
      }
    }
  }
}