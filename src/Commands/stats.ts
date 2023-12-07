import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { botStats } from "../Data/DatabaseSchema";
import FormatTime from "../Funcs/FormatTime";
import Command from "../types/Command";

function statElement(input: string): string {
  return `\`\`\`${input}\`\`\``
}

const stats: Command = {
  permissions: [],
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View global(todo), per-user(todo) or per-server stats for the bot.'),

  callback: async ({ interaction }) => {
    const [record] = await botStats.findOrCreate({
      where: { guildId: interaction.guild!.id },
      defaults: {
        commandsRan: 0,
        sessionCount: 0,
        vcTime: 0,
        longestPlaylist: 0
      }
    });

    const vcTime = FormatTime(record?.getDataValue('vcTime') ?? 0)

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Showing stats for ${interaction.guild?.name}`, iconURL: interaction.guild?.iconURL() ?? undefined })
      .addFields(
        {
          name: 'Commands Ran',
          value: statElement(record?.getDataValue('commandsRan') ?? 0),
          inline: true
        },
        {
          name: 'Music Sessions',
          value: statElement(record?.getDataValue('sessionCount') ?? 0),
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