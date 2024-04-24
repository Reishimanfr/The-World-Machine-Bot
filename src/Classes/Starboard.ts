import axios from 'axios'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  type GuildEmoji,
  type MessageReaction,
  type PartialMessageReaction,
  type ReactionEmoji
} from 'discord.js'
import { clipString } from '../Funcs/ClipString'
import { serverStats, starboardConfig, starboardEntries } from '../Models'
import { logger } from '../Helpers/Logger'
import { client } from '..'

type ReactionOrPart = MessageReaction | PartialMessageReaction

interface ConfigOptions {
  boardId: string,
  amount: number,
  emojis: string
  bannedChannels: string
}

export class Starboard {
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
    let formattedEmoji = reactionEmoji.animated ? '<a:' : ''

    formattedEmoji += reactionEmoji.id
      ? `<:${reactionEmoji.name}:${reactionEmoji.id}>`
      : this.reaction.emoji.name ?? 'Error!'

    return formattedEmoji
  }

  private async setImage(): Promise<string | null> {
    const message = this.reaction.message
    const attachments = message.attachments.filter(att => att.contentType?.startsWith('image/'))

    // Priority list: attachments, tenor links, discord cdn links

    if (attachments.size) {
      for (const [_, att] of attachments.entries()) {
        const isValidMedia = await this.checkIfValidImage(att.url)

        if (isValidMedia) {
          return att.url
        }
      }
    }

    const splitContent = message.content?.split(/ +/g)
      .filter(part => part.startsWith('https'))

    if (splitContent?.length) {
      for (const part of splitContent) {
        // Check if tenor link...
        if (part.startsWith('https://tenor.com/')) {
          const id = part.match(/https:\/\/tenor.com\/view\/.+-(\d+)/)

          if (!id?.at(1)) continue

          const request = await axios
            .get(`https://api.tenor.com/v1/gifs?ids=${id[1]}&key=${process.env.TENOR_API_KEY}`)
            .catch(error => logger.error(`Failed to fetch tenor gif for starboard message: ${error.stack}`))

          return request?.data.results[0].media[0].gif.url ?? null

        // ...If not check if link that leads to a message
        }
        
        if (await this.checkIfValidImage(part)) return part 
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

      // Request went through and content-type is an image
      return response.status >= 200
          && response.status < 300
          && response.headers['content-type'].startsWith('image/')

    } catch (error) {
      if (error.message.endsWith("403")) return false // Mainly twitter errors
      // let's not spam the logs shall we

      logger.error(`Error checking URL ${url}: ${error}`)
      return false
    }
  }

  private async setFields(): Promise<string[]> {
    const message = this.reaction.message
    const fields: string[] = []

    if (message.reference) {
      const reference = await message.fetchReference()
      const refEmbed = reference.embeds[0] ?? null
      let referenceString = ''

      if (reference.content) {
        referenceString += ` ${reference.content}`
      } else if (refEmbed?.data?.description) {
        referenceString += refEmbed?.data?.description
      } else if (reference.attachments.size) {
        referenceString = `__Message contains ${reference.attachments.size} attached file${reference.attachments.size > 1 ? 's' : ''}__`
      } else {
        referenceString = '⚠️ Failed to fetch message reference TwT'
      }

      fields.push(`### ↩️ Replying to:\n${clipString({ string: referenceString, maxLength: 500, sliceEnd: '...' })}`)
    }

    if (
      message.content ||
      message.embeds[0]?.data?.description ||
      message.attachments.size
    ) {
      const embed = message.embeds[0] ?? null
      let contentString = ''

      const messageIsLinkOnly =
        message.content &&
        message.content?.split(' ').length === 1 &&
        message.content.startsWith('https://')

      if (messageIsLinkOnly) {
        fields.push(`### 📄 Message:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n${message.content}`)
        return fields
      }

      if (message.content) {
        contentString += message.content
      } else if (embed?.data?.description) {
        contentString += embed?.data?.description
      } else if (message.attachments.size) {
        contentString = `__Message contains ${message.attachments.size} attached file${message.attachments.size > 1 ? 's' : ''}__`
      } else {
        contentString = '⚠️ Failed to fetch message content TwT'
      }

      fields.push(`### 📄 Message:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n${contentString}`)
    }

    return fields
  }

  public async main() {
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

    for (const [_, react] of reaction.message.reactions.cache) {
      let emojiName = react.emoji.name

      if (react.emoji.id) {
        emojiName = `<${react.emoji.animated ? 'a' : ''}:${react.emoji.name}:${react.emoji.id}>`
      }

      if (emojiName && config.emojis.split(' ').includes(emojiName)) {
        reactions.push({ emoji: emojiName, count: react.count })
      }
    }

    reactions.sort((a, b) => b.count - a.count)

    // None of the reactions are equal or more than config amount
    if (!reactions.some((rect) => rect.count >= config.amount)) return

    // Format the emojis: {emoji} * {emoji}...
    const reactionStrings: string[] = reactions.map(r => `${r.emoji} ${r.count}`)

    const boardChannel = await reaction.message.guild?.channels.fetch(config.boardId)

    if (!boardChannel) return
    if (boardChannel.type !== ChannelType.GuildAnnouncement && boardChannel.type !== ChannelType.GuildText) return

    const dbEntry = await starboardEntries.findOne({ where: { starredMessageUrl: reaction.message.url } })

    // Basically we confirmed the server uses the starboard by now so it's fine to reset the timeout
    const [timeoutRecord] = await serverStats.findOrCreate({
      where: { guildId: reaction.message.guildId },
      defaults: { guildId: reaction.message.guildId, lastActive: new Date() }
    })

    timeoutRecord.update({ lastActive: new Date() })

    if (dbEntry === null) {
      const [member, fields, embedImage] = await Promise.all([
        reaction.message.guild?.members.fetch(reaction.message.author!.id),
        this.setFields(),
        this.setImage(),
      ])


      const embed = new EmbedBuilder()
        .setAuthor({
          name: reaction.message.author?.displayName ?? '⚠ Failed to get author\'s name TwT',
          iconURL: reaction.message.author?.displayAvatarURL() ?? undefined,
        })
        .setColor(member?.displayHexColor ?? '#2b2d31')
        .setDescription(fields.join('\n'))
        .setImage(embedImage ?? null)

      const buttons: Array<ButtonBuilder> = [
        new ButtonBuilder()
          .setLabel('Message')
          .setStyle(ButtonStyle.Link)
          .setURL(reaction.message.url)
      ]

      const messageRef = await reaction.message.fetchReference()
        .catch(() => { })

      if (messageRef) {
        buttons.push(
          new ButtonBuilder()
            .setLabel('Reference')
            .setStyle(ButtonStyle.Link)
            .setURL(messageRef.url)
        )
      }

      const refButton = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(buttons)

      try {
        const permissions = boardChannel.permissionsFor(client.user.id)

        if (!permissions?.has('SendMessages')) {
          reaction.message.reply(`⚠️ I can't send messages in <#${config.boardId}> TwT`)
          return
        }

        const res = await boardChannel.send({
          embeds: [embed],
          components: [refButton],
          content: `**${reactionStrings.join(' • ')}** | <#${reaction.message.channelId}>`
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
    } else {
      const messageDataSplit = await dbEntry?.getDataValue('botMessageUrl').split('/')
      const messageId = messageDataSplit?.length ? messageDataSplit[messageDataSplit?.length - 1] : null
      const entryMessage = messageId ? (await boardChannel.messages.fetch(messageId) ?? null) : null

      if (!entryMessage) return

      try {
        await entryMessage.edit({
          content: `**${reactionStrings.join(' • ')}** | <#${reaction.message.channelId}>`
        })
      } catch (error) {
        logger.error(`Failed to update starboard message: ${error.stack}`)
      }
    }
  }
}