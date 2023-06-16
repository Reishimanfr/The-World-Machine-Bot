import { ChannelType, Colors, Message, PermissionResolvable } from "discord.js"
import { setTimeout } from "timers/promises"
import { logger } from "../Tools/logger"
import { nitroEmojis } from "./Models"

const isEmoji = (part: string): boolean => {
    return /^:.+:$/.test(part)
}

export const onMessage = async (message: Message) => {
    const hasEmoji = message.content.split(' ').some(isEmoji)
    
    if (hasEmoji) {
        // Config
        const deleteTimeout = 10000 // 1000 - 1s

        // User stuff
        const member = await message.guild.members.fetch(message.author.id)

        // Bot stuffs
        const botPerms = message.guild.members.me.permissions
        const requiredPerms: PermissionResolvable[] = ['ManageEmojisAndStickers', 'ManageWebhooks', 'ManageMessages']
        const missingPerms = requiredPerms.filter(perm => !botPerms.has(perm))

        // Emoji cache for user
        const emojiData = await nitroEmojis.findAll({ where: { userId: member.id }})
        
        // All the reasons the bot could exit for
        if (!emojiData.length) return

        if (!member.permissions.has('UseExternalEmojis')) {
            message.reply({ embeds: [{ description: 'This script requires you to have the `UseExternalEmojis` permission.', color: Colors.Red }] })
            return 
        }

        if (missingPerms.length > 0) {
            message.reply({ embeds: [{ description: `The bot is missing the following permissions: \`\`\`${missingPerms.join(', ')}\`\`\``}] })
                .then(async m => {
                    await setTimeout(deleteTimeout)
                    m.delete().catch(e => logger.error(e.stack))
                })
            return
        }

        let constructMessage = []
        let createdEmojis = []

        // Constructing the message
        for await (const part of message.content.split(' ')) {
            const emojiData = await nitroEmojis.findOne({ where: { userId: member.id, emojiName: part }})

            if (!isEmoji(part) || !emojiData) {
                constructMessage.push(part)
                continue
            } else {
                const link = emojiData.get('emojiLink') as string
                const animated = link.endsWith('.gif')
                const emoji = await message.guild.emojis.create({ attachment: link, name: part.slice(1, -1) })

                constructMessage.push(`<${animated ? 'a' : ''}${part}${emoji.id}>`)
                createdEmojis.push(emoji.id)
            }
        }

        if (!createdEmojis.length) return

        message.react('💬')

        // Processing the webhook and sending messages with it
        async function processWebhook() {
            if (message.channel.type !== ChannelType.GuildText) {
                throw new Error('The channel is not text based.', { cause: 'CHANNEL_NOT_TEXT_BASED'})
            }
            if (!message.deletable) {
                throw new Error('Original message is not deletable by the bot.', { cause: 'MESSAGE_NOT_DELETABLE'})
            }

            const webhook = await message.channel.createWebhook({
                name: member.nickname ?? message.author.username,
                avatar: member.displayAvatarURL({ extension: 'png' })
            })

            await message.delete()
            await webhook.send({ content: `${constructMessage.join(' ')}` })
            
            const emojiDeletionPromises = createdEmojis.map(emoji => {
                message.guild.emojis.fetch(emoji).then(fEmoji => fEmoji.delete())
            })

            await Promise.all(emojiDeletionPromises)

            return webhook
        }

        try {
            const webhook = await processWebhook()
            await webhook.delete()
        } catch (error) {
            logger.error(error.stack)
            let options = { embeds: [{ description: `There was a error while processing your request: \`\`\`${error.name}\`\`\``, color: Colors.Red }]}

            if (message) {
                await message.reactions.removeAll()
                message.react('⚠️')

                message.reply(options)
                    .then(async m => {
                        await setTimeout(deleteTimeout)
                        m.delete()
                            .catch(e => logger.error(e.stack))
                    })
            } else {
                message.channel.send(options)
                    .then(async m => {
                        await setTimeout(deleteTimeout)
                        m.delete()
                            .catch(e => logger.error(e.stack))
                    })
            }
        }
    }
}