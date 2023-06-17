import { Client, Colors, EmbedBuilder, Interaction, InteractionType } from "discord.js"
import { CommandList } from "../Commands/!!CommandsExport"
import { handleError } from "../Misc/interactionErrorHandler"
import { logger } from "../Misc/logger"
import { reactionRoles } from "./Models"

export const InteractionCreate = async (interaction: Interaction, client: Client) => {

    if (interaction.type === InteractionType.ApplicationCommand) {
        // Global commands
        for (const current of CommandList) {
            if (interaction.commandName !== current.data.name) continue

            const requiredPerms = current.permissions
            const botPerms = interaction.guild.members.me.permissions
            const missingPerms = requiredPerms.filter(perm => !botPerms.has(perm))

            if (missingPerms.length > 0) {
                const replyEmbed = new EmbedBuilder()
                    .setDescription(`This command requires permissions that the bot is missing:\`\`\`${missingPerms.join(', ')}\`\`\``)
                    .setColor(Colors.Red)
                
                return interaction.reply({ embeds: [replyEmbed], ephemeral: true })
                    .catch(e => logger.error(e.stack))
            }

            try {
                await current.run(interaction, client)
            } catch (error) {
                logger.error(error.stack)
            }
        }

    }

    if (interaction.isButton()) {
        try {
            if (!interaction.customId.endsWith('-REACTROLE')) return

            const split = interaction.customId.split('^^').slice(0, -1)
            const label = split[0]
            const roleId = split[1]

            const button = await reactionRoles.findOne({
                where: {
                    guildId: interaction.guildId,
                    messageId: interaction.message.id,
                    roleId: roleId,
                    label: label
                }
            })

            if (!button) return

            const role = await interaction.guild.roles.fetch(roleId)
    
            if (!interaction.inCachedGuild()) return // Typeguard

            if (interaction.guild.members.me.roles.highest.position < role.position) {
                return interaction.reply({ embeds: [{ description: `:x: I can't assign this role to you because it's higher up than mine`, color: Colors.Red }], ephemeral: true })
            }

            if (!interaction.member.roles.cache.get(role.id)) {
                interaction.member.roles.add(role)
                return interaction.reply({ embeds: [{ description: `:white_check_mark: Role ${role} assigned`, color: role.color }], ephemeral: true })
            } else {
                interaction.member.roles.remove(role)
                return interaction.reply({ embeds: [{ description: `:white_check_mark: Role ${role} revoked`, color: role.color }], ephemeral: true })
            }
        } catch (error) {
            handleError(error, interaction)
        }
    }
}