import { ChatInputCommandInteraction, ComponentType, EmbedBuilder } from "discord.js";
import { botConfigOptions } from "../../Helpers/DatabaseSchema";
import util from "../../Helpers/Util";
import { changeSettingButtons, channelSelectMenu } from "./_buttons";

export default async function updateLogs(interaction: ChatInputCommandInteraction) {
	const currentConfig = await botConfigOptions.findOne({ where: { guildId: interaction.guild!.id } })
	const currentErrorChannel = currentConfig?.getDataValue('updateLogs')
	const messageString = `[ ${currentErrorChannel
		? `The current update logs channel is set to <#${currentErrorChannel}>.`
		: 'A update logs channel hasn\'t been setup yet.'} ]`

	const settingButton = await interaction.editReply({
		embeds: [new EmbedBuilder()
			.setDescription(messageString)
			.setColor(util.embedColor)
		],
		components: [changeSettingButtons]
	})

	const settingButtonCollector = await settingButton.awaitMessageComponent({
		componentType: ComponentType.Button,
		time: 60000,
	})

	await settingButtonCollector.deferUpdate()
	if (!settingButtonCollector) return 0;

	const button = settingButtonCollector.customId

	if (button == 'change') {
		const channelSelect = await interaction.editReply({
			embeds: [new EmbedBuilder()
				.setDescription('[ Please select a channel where the update logs should be sent. ]')
				.setColor(util.embedColor)
			],
			components: [channelSelectMenu]
		})

		const channelSelectCollector = await channelSelect.awaitMessageComponent({
			componentType: ComponentType.ChannelSelect,
			time: 60000
		})

		await channelSelectCollector.deferUpdate()
		if (!channelSelectCollector) return 0;

		const collected = channelSelectCollector.values[0]

		interaction.editReply({
			embeds: [new EmbedBuilder()
				.setDescription(`[ Done! The new update logs channel has been set to <#${collected}>! ]`)
				.setColor(util.embedColor)
			],
			components: []
		})

		if (!currentConfig) {
			await botConfigOptions.create({
				guildId: interaction.guild!.id,
				errorLogs: null,
				updateLogs: collected
			})
		} else {
			await botConfigOptions.update({
				updateLogs: collected
			}, { where: { guildId: interaction.guild!.id } })
		}
		return 1
	}

	interaction.editReply({
		embeds: [new EmbedBuilder()
			.setDescription('[ Sure! No changes will be made. ]')
			.setColor(util.embedColor)
		],
		components: []
	})
	return 1
}
