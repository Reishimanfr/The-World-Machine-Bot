import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "../types/Command";
import { botStats } from "../Helpers/DatabaseSchema";
import FormatTime from "../functions/FormatTime";

function statElement(input: string): string {
  return `\`\`\`${input}\`\`\``
}

const stats: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View global(todo), per-user(todo) or per-server stats for the bot.'),

  callback: async (interaction) => {
    const record = await botStats.findOne({ where: { guildId: interaction.guild!.id } });
    const vcTime = FormatTime(record?.getDataValue('vcTime') ?? 0)

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Showing stats for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? '' })
      .addFields(
        {
          name: 'Commands Ran',
          value: statElement(record?.getDataValue('commandsRan')),
          inline: true
        },
        {
          name: 'Music Sessions',
          value: statElement(record?.getDataValue('sessionCount')),
          inline: true
        },
        {
          name: 'Music playing time',
          value: statElement(vcTime.length ? vcTime : '0 seconds'),
          inline: true
        },
        {
          name: 'Longest playlist',
          value: statElement(record?.getDataValue('longestPlaylist') ?? 0 + ' tracks'),
          inline: true
        },
        {
          name: 'Server count',
          value: statElement(`${interaction.client.guilds.cache.size}/100`),
          inline: true
        }
      )
      .setColor('#2b2d31')

    interaction.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
}

export default stats