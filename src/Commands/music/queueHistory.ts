import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";
import { formatSeconds } from "../../Funcs/FormatSeconds";
import { logger } from "../../Helpers/Logger";
import { embedColor } from "../../Helpers/Util";
import { queueHistory as queueHistoryDB } from "../../Models";
import Command from "../../types/Command";

const queueHistory: Command<true> = {
  permissions: {
    user: ['SendMessages'],
    bot: ['SendMessages']
  },

  data: new SlashCommandBuilder()
    .setName("queue-history")
    .setDescription("Shows the queue history of a session")
    .addStringOption(id => id
      .setName("id")
      .setDescription("ID of the player's session.")
      .setRequired(true)
    ),

  musicOptions: {
    requiresPlaying: false,
    requiresVc: false,
    requiresDjRole: false
  },

  callback: async ({ interaction }) => {
    const id = interaction.options.getString("id", true);
    const data = await queueHistoryDB.findOne({ where: { UUID: id } });

    if (!data) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ No data for this ID. ]")
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    const entriesData = await data.getDataValue("entries");
    const groups: string[] = entriesData.split("/split/");
    groups.pop(); // the last string is empty and im too lazy to fix that

    const entries: any[] = [];

    groups.forEach((entry) => {
      entries.push(JSON.parse(entry));
    });
    const embeds: EmbedBuilder[] = [];

    if (!entries.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ No entries for this ID. ]")
            .setColor(embedColor),
        ],
        ephemeral: true,
      });
    }

    let queueHistoryEntries: string[] = [];
    const splitter = 6;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      let content = "";

      // Parts of content
      // Index
      content += `\`${i + 1}:\` `;
      // Title - Author in hyperlink
      content += `**[${entry.title} - ${entry.author}](${entry.uri})**`;
      // Added by
      content += `\nAdded by <@${entry?.requester ?? '0'}> `;
      // Duration
      content += `| Duration: \`${formatSeconds(entry.length / 1000)}\`\n\n`;

      // title author uri requester length 

      queueHistoryEntries.push(content);
    }

    for (let i = 0; i < queueHistoryEntries.length; i += splitter) {
      const arraySlice = queueHistoryEntries.slice(i, i + splitter);

      embeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `[ ${queueHistoryEntries.length} songs were played during this session. ]`,
          })
          .setDescription(arraySlice.join(""))
      );
    }

    if (embeds.length == 1) {
      return interaction.reply({
        embeds: [...embeds],
        ephemeral: true,
      });
    }

    const buttons: ButtonBuilder[] = [
      new ButtonBuilder()
        .setCustomId("back")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("forward")
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary),
    ];

    const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buttons
    );

    let page = 0;

    const res = await interaction.reply({
      embeds: [
        embeds[page].setFooter({
          text: `Page 1/${embeds.length}`,
        }),
      ],
      components: [components],
      ephemeral: true
    });

    const collector = res.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (button) => {
      await button.deferUpdate();
      collector.resetTimer();

      if (button.customId == "back") {
        page = page > 0 ? --page : embeds.length - 1;
      } else if (button.customId == "forward") {
        page = page + 1 < embeds.length ? ++page : 0;
      }

      interaction.editReply({
        embeds: [
          embeds[page].setFooter({
            text: `Page ${page + 1}/${embeds.length} `,
          }),
        ],
      });
    });

    collector.on("end", async (_) => {
      const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttons[0].setDisabled(true),
        buttons[1].setDisabled(true)
      );

      try {
        await interaction.editReply({ components: [newRow] });
      } catch (error) {
        logger.error(
          `Failed to remove buttons from player audit log message: ${error}`
        );
      }
    });
  },
};

export default queueHistory;
