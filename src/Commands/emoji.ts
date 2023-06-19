import { ChatInputCommandInteraction, Colors, SlashCommandBuilder } from 'discord.js';
import Command from '../Interfaces/Command';
import { nitroEmojis } from '../Interfaces/Models';

export const emoji: Command = {
    permissions: ['ManageWebhooks', 'ManageEmojisAndStickers', 'ManageMessages'],
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Register a nitro emoji to send it without nitro!')
        .addStringOption(register => register
            .setName('emoji')
            .setDescription('Register a emoji')
            .setRequired(true)
        ),

    run: async (command: ChatInputCommandInteraction) => {
        const member = await command.guild.members.fetch(command.user.id);

        if (!member.permissions.has('UseExternalEmojis')) {
            command.reply({ embeds: [{ description: '⚠️  You\'re missing the `Use external emojis` permission, which is required by the command.' }], ephemeral: true });
            return;
        }

        const rawEmoji: string = command.options.getString('emoji');
        const matchEmoji: RegExpMatchArray = rawEmoji.match(/<a?:(\w{1,32}):([0-9]{15,20})>$/);
        const isAnimated: boolean = rawEmoji.charAt(1) === 'a';

        if (!matchEmoji) {
            command.reply({ embeds: [{ description: '❌  Can\'t find this emoji, are you sure the name\'s valid?', color: Colors.Red }], ephemeral: true });
            return;
        }

        const link = `https://cdn.discordapp.com/emojis/${matchEmoji[2]}${isAnimated ? '.gif' : '.png'}`;
        const emojiName = `:${matchEmoji[1]}:`;

        const [record, created] = await nitroEmojis.findOrCreate({
            where: { userId: command.user.id, emojiName: emojiName },
            defaults: { userId: command.user.id, emojiName: emojiName, emojiLink: link },
        });

        if (!created) {
            record.update({ emojiLink: link }, { where: { userId: command.user.id, emojiName: emojiName } });
        }

        command.reply({ embeds: [{ description: '✅  Emoji registered!\nℹ️  To use it just send it\'s name with colons in the channel!', color: Colors.Green }], ephemeral: true });
    },
};