import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { queueHistory as queueHistoryDB } from "../../../Helpers/DatabaseSchema";
import { ExtPlayer } from "../../../Helpers/ExtendedClient";
import { logger } from "../../../Helpers/Logger";
import util from "../../../Helpers/Util";
import { formatSeconds } from "../../../functions/formatSeconds";
import Subcommand from "../../../types/Subcommand";

const queueHistory: Subcommand = {
  musicOptions: {
    requiresPlayer: false,
    requiresPlaying: false,
    requiresVc: false,
  },

  callback: async (
    interaction: ChatInputCommandInteraction,
  ) => {
    const uuid = interaction.options.getString("uuid", true);
    const data = await queueHistoryDB.findOne({ where: { UUID: uuid } });

    if (!data) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ No data for this UUID. ]")
            .setColor(util.embedColor),
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
            .setDescription("[ No entries for this UUID. ]")
            .setColor(util.embedColor),
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
      content += `\nAdded by <@${entry.requester}> `;
      // Duration
      content += `| Duration: \`${formatSeconds(entry.length / 1000)}\`\n\n`;

      queueHistoryEntries.push(content);
    }

    for (let i = 0; i < queueHistoryEntries.length; i += splitter) {
      const arraySlice = queueHistoryEntries.slice(i, i + splitter);

      embeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `[ ${queueHistoryEntries.length} songs were played in this session. ]`,
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
