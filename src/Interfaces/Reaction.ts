import { ChannelType, Client, Colors, EmbedBuilder, MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js"
import { logger } from "../Misc/logger"
import { starboardConfig, starboardEmojis } from "./Models"
import axios from "axios"

async function fetchTenorGif(url: string) {

    const regEx = /https:\/\/tenor.com\/view\/.+-(\d+)/
    const id = url.match(regEx)[1]
    const fetchUrl = `https://api.tenor.com/v1/gifs?ids=${id}&key=${process.env.TENOR_KEY}`

    const request = await axios.get(fetchUrl)
        .catch(error => logger.error(error.stack))

    console.log(JSON.stringify(request.data))

    const data = request.data

    return data
}

const colors = {
    "⭐": "Gold",
    "❤️": "Red",
    "💛": "Yellow",
    "💚": "Green",
    "💙": "Blue",
    "💜": "Purple"
}

export const starboardLogic = async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, client: Client) => {
    if (reaction.partial || user.partial) {
        try {
            await reaction.fetch()
            await user.fetch()
        } catch (error) {
            logger.error(error.stack)
            return
        }
    }

    // TODO fix this shitty fucking database you stupid dumb dumb
    // * Fixed :3
    const config = await starboardConfig.findOne({ where: { guildId: reaction.message.guildId }})

    const { boardId, amount } = config.dataValues
    const { message } = reaction
    const { attachments } = message

    if (process.env.DEV !== 'true') {
        if (!boardId || message.channelId === boardId) return
        if (message.author.bot || message.author.id === user.id) return
    }

    const emojiData = await starboardEmojis.findAll({ where: { guildId: reaction.message.guildId }})
    const emojis = emojiData.map(obj => obj.dataValues.emoji)

    if (!emojis.includes(reaction.emoji.name)) return

    let reactions = []
    let reactionString = []

    //* This will be rewritten someday I swear
    message.reactions.cache.forEach(reaction => {
        if (emojis.includes(reaction.emoji.name)) {
            reactions.push({ emoji: reaction.emoji.name, count: reaction.count })
        }
    })

    reactions.sort((a, b) => b.count - a.count)

    for (const key of reactions) {
        reactionString.push(`${key.emoji} ${key.count}`)
    }

    if (!reactions.some(rec => rec.count >= amount)) return

    const starboardChannel = (await message.guild.channels.fetch(boardId))
    if (!starboardChannel || starboardChannel.type != ChannelType.GuildText) return

    const boardMessages = await starboardChannel.messages.fetch({ limit: 100 })
    const starredMessage = boardMessages.find(m => m.author.id == client.user.id && m.embeds.length && m.embeds[0]?.footer?.text.endsWith(message.id))

    if (starredMessage) {
        if (!reactions.length) {
            starredMessage.delete()
                .catch(e => logger.error(e.stack))
            return
        }

        const embed = EmbedBuilder.from(starredMessage.embeds[0])
            .setColor(colors[reactions[0].emoji] ?? Colors.Gold)
            .setAuthor({ name: `${reactionString.join(' • ')}` })

        starredMessage.edit({ embeds: [embed] })
        return
    } else if (!starredMessage) {
        const regex = /(https?:\/\/(www\.)?(tenor\.com|media\.discordapp\.net|cdn\.discordapp\.com)[^\s]+)/gi
        const attachmentLinkOnly = message.content.split(' ').length >= 1 && regex.test(message.content)
        const replyContent = message.reference ? (await message.channel.messages.fetch(message.reference.messageId)).content : ''

        const fields = [
            { name: '🔗 Link:', value: message.url, inline: true },
            { name: `✏️ Author:`, value: `<@${message.author.id}>`, inline: true },
        ]

        if (message.reference) {
            fields.push({ name: '↩️ Replying to:', value: replyContent || '⚠️ Error getting message reference', inline: false })
        }

        if (message.content && !attachmentLinkOnly) {
            fields.push({ name: '📄 Message:', value: message.content || '⚠️ Error getting message', inline: false })
        }

        const embed = new EmbedBuilder()
            .setColor(colors[reactions[0].emoji])
            .setThumbnail(message.author.displayAvatarURL({ extension: 'png' }))
            .setAuthor({ name: `${reactionString.join(' • ')}` })
            .addFields(fields)
            .setFooter({ text: `ID: ${message.id}` })

        async function setImage() {
            const possibleLinks = message.content?.split(' ').filter(part => part.startsWith('http'))

            logger.debug(`Possible links: ` + possibleLinks)

            if (attachments.size) {
                return embed.setImage(attachments.first()?.url)
            }

            if (!possibleLinks?.length) return

            for (const link of possibleLinks) {
                if (link.startsWith('https://tenor.com')) {

                    if (!process.env.TENOR_KEY) {
                        logger.warn(`Can\'t fetch tenor gif: no tenor API key provided.`)
                        break
                    }

                    let gifLink = (await fetchTenorGif(link)).results[0].media[0].gif.url

                    embed.setImage(gifLink)
                }
            }
        }

        try {
            await setImage()
            starboardChannel.send({ embeds: [embed] })
        } catch (error) {
            logger.error(error.stack)
        }
    }
}