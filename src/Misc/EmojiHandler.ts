import { ChannelType, Colors, Message, PermissionResolvable } from 'discord.js';
import { nitroEmojis } from '../Interfaces/Models';
import { logger } from './logger';
import { setTimeout } from 'timers/promises';

export class EmojiHandler {
    private context: Message;
    private message_content: string[] = [];
    private created_emojis: string[] = [];
    private delete_timeout: number = 1000 * 10;
    private required_permissions: PermissionResolvable[] = ['ManageEmojisAndStickers', 'ManageWebhooks', 'ManageMessages'];

    constructor(message: Message) {
        this.context = message;
    }

    public emoji_validator(part: string): boolean {
        return /^:.+:$/.test(part);
    }

    private async handle_webhook_error(error: Error): Promise<void> {
        const options = { embeds: [{ description: `There was a error while processing your request: \`\`\`${error.name}\`\`\``, color: Colors.Red }] };

        const response = this.context ? await this.context.reply(options) : await this.context.channel.send(options);

        if (response && response.deletable) {
            await setTimeout(this.delete_timeout);

            response.delete()
                .catch(error => logger.error(error.stack));
        }
    }

    private async destroy_emojis(): Promise<void> {
        const emoji_deletion_promises = this.created_emojis.map(current => {
            this.context.guild.emojis.fetch(current).then(e => e.delete());
        });

        await Promise.all(emoji_deletion_promises)
            .catch(error => logger.error(error.stack));
    }

    private async construct_message(): Promise<string[]> {
        for await (const part of this.context.content.split(' ')) {
            const emoji_data = await nitroEmojis.findOne({ where: { userId: this.context.member.id, emojiName: part } });

            if (!this.emoji_validator(part) || !emoji_data) {
                this.message_content.push(part);
                continue;
            }

            const link = emoji_data.get('emojiLink') as string;
            const animated = link.endsWith('.gif');
            const emoji = await this.context.guild.emojis.create({ attachment: link, name: part.slice(1, -1) });

            this.message_content.push(`<${animated ? 'a' : ''}${part}${emoji.id}>`);
            this.created_emojis.push(emoji.id);
        }

        return this.message_content;
    }

    private async create_webhook(): Promise<void> {
        if (this.context.channel.type !== ChannelType.GuildText) {
            throw new Error('The channel is not text based', { cause: 'CHANNEL_NOT_TEXT_BASED' });
        }

        if (!this.context.deletable) {
            throw new Error('Original message is not deletable by the bot', { cause: 'MESSAGE_NOT_DELETABLE' });
        }

        try {
            const webhook = await this.context.channel.createWebhook({
                name: this.context.member.nickname ?? this.context.author.username,
                avatar: this.context.member.displayAvatarURL(),
            });

            await this.context.delete();
            await webhook.send({ content: `${this.message_content.join(' ')}` });
            await webhook.delete();
        } catch (error) {
            logger.error(error.stack);

            await this.handle_webhook_error(error);
        } finally {
            await this.destroy_emojis();
        }
    }

    public async initiate_emoji(): Promise<void> {
        const emoji_data = await nitroEmojis.findAll({ where: { userId: this.context.member.id } });

        if (!emoji_data) return;

        // Bot permissions
        const bot_permissions = this.context.guild.members.me.permissions;
        const missing_permissions = this.required_permissions.filter(permission => !bot_permissions.has(permission));

        if (!this.context.member.permissions.has('UseExternalEmojis')) {
            this.context.reply({ embeds: [{ description: 'This script requires you to have the `Use External Emojis` permission.' }] });
            return;
        }

        if (missing_permissions.length) {
            this.context.reply({ embeds: [{ description: `The bot is missing the following permissions:\`\`\`${missing_permissions.join(', ')}\`\`\`` }] })
                .then(async message => {
                    await setTimeout(this.delete_timeout);
                    message.delete().catch(error => logger.error(error.stack));
                });
            return;
        }

        await this.construct_message();
        await this.create_webhook();
        await this.destroy_emojis();
    }
}