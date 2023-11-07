import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import util, { optionsType } from "./Util";

// type AnyInteraction =
// 	| CommandInteraction
// 	| Interaction
// 	| ButtonInteraction
// 	| StringSelectMenuInteraction
// 	| ChannelSelectMenuInteraction
// 	| ChatInputCommandInteraction

type AnyCommandInteraction = CommandInteraction | ChatInputCommandInteraction

/**
 * This function will handle any interaction error via replying or following up with a
 * error message. If that's impossible the bot will try to send a normal message to the
 * channel if it has permissions for it.
 */
async function replyOrFollowup(error: Error, interaction: AnyCommandInteraction): Promise<any> {
	const errorEmbed = new EmbedBuilder()
		.setAuthor({ name: 'A error has occured!', iconURL: 'TODO' })
		.setDescription(`This interaction has failed with error: \`\`\`${error.message}\`\`\``)
		.setTimestamp()
		.setFooter({ text: '[Support server](https://discord.gg/xBARxUqyVc)' })
		.setColor(util.embedColor)

	if (interaction.isRepliable() && !interaction.replied) {
		return interaction.reply({
			embeds: [errorEmbed],
			ephemeral: interaction.ephemeral ?? true
		})
	}

	if (interaction.replied) {
		return interaction.followUp({
			embeds: [errorEmbed],
			ephemeral: interaction.ephemeral ?? true
		})
	}

	const channel = interaction?.channel ?? null

	if (!interaction.isRepliable() && channel && channel.isTextBased()) {
		const textChannel = channel as TextChannel

		if (!textChannel.permissionsFor(interaction.applicationId)?.has('SendMessages')) return

		return textChannel.send({
			embeds: [errorEmbed]
		})
	}
}

export default async function handlerError(
	interaction: AnyCommandInteraction,
	error: Error,
	adminErrorMessageOptions?: optionsType
) {
	await replyOrFollowup(error, interaction);

	if (adminErrorMessageOptions) {
		await util.sendAdminErrorMsg(adminErrorMessageOptions)
	}
}
