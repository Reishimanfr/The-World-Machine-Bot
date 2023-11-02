import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { ExtPlayer } from "../../../Helpers/ExtendedClient";
import { logger } from "../../../Helpers/Logger";
import util from "../../../Helpers/Util";
import Subcommand from "../../../types/Subcommand";

const audit: Subcommand = {
  musicOptions: {
    requiresPlayer: true,
    requiresPlaying: false,
    requiresVc: false,
  },

  callback: async (interaction, player: ExtPlayer) => {

    if (!player.auditLog?.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ There are no entries in the audit log. ]")
            .setColor(util.embedColor),
        ],
        ephemeral: true,
      });
    }

    const sortedLog = player?.auditLog?.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    })

    const embeds: EmbedBuilder[] = [];
    const splitter = 5; // Entries per page

    // Slice the array into chunks of 5 entries
    for (let i = 0; i < sortedLog?.length; i += splitter) {
      const arraySlice = sortedLog?.slice(i, i + splitter);

      let embedDescription = '';

      // Work with the array slice parts 
      for (let j = 0; j < arraySlice?.length; j++) {
        embedDescription += `**${arraySlice[j].date}** | **${arraySlice[j].user.username}**: **${arraySlice[j].func}**\n`;
      }

      embeds.push(
        new EmbedBuilder()
          .setAuthor({ name: `[ There are ${arraySlice?.length} entries in the audit log. ]` })
          .setDescription(embedDescription)
          .setColor(util.embedColor),
      )
    }

    if (embeds.length == 1) {
      return interaction.reply({
        embeds: [embeds[0]],
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

    const components = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(buttons);

    let page = 0;

    const res = await interaction.reply({
      embeds: [embeds[page].setFooter({ text: `Page 1/${embeds.length}` })],
      ephemeral: true,
      components: [components],
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

      res.edit({
        embeds: [
          embeds[page].setFooter({
            text: `Page ${page + 1}/${embeds.length}`,
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
        await res.edit({ components: [newRow] });
      } catch (error) {
        logger.error(
          `Failed to remove buttons from player audit log message: ${error}`
        );
      }
    });
  }
}


export default audit;
