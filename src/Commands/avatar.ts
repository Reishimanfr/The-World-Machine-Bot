import Command from "../Interfaces/Command"
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js"

export const avatar: Command = {
    permissions: ['EmbedLinks'],
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Returns the avatar of a user')
        .addUserOption(user => user
            .setName('user')
            .setDescription('User to fetch')
            .setRequired(true)
        )
        .addBooleanOption(ephemeral => ephemeral
            .setName('secret')
            .setDescription('Should you be the only one seeing the message?')
        ),

    run: (command: ChatInputCommandInteraction) => {
        if (!command.inCachedGuild()) return // Typeguard

        const { options } = command
        
        const member = options.getMember('user') ?? command.member
        const secret = options.getBoolean('secret') ?? false

        const replyEmbed = new EmbedBuilder()
            .setAuthor({ name: `Avatar of ${member.user.tag}`})
            .setImage(member.displayAvatarURL({ size: 2048, extension: 'png' }))
            .setColor(member.roles.highest.color)

        command.reply({ embeds: [replyEmbed], ephemeral: secret })
    }
}