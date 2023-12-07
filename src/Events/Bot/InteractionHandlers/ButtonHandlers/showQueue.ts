import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder
} from "discord.js";
import { Track } from "poru";
import { formatSeconds } from "../../../../Funcs/FormatSeconds";
import { log } from "../../../../Helpers/Logger";
import { embedColor } from "../../../../Helpers/Util";
import { ButtonFunc } from "./!buttonHandler";

export const showQueue: ButtonFunc = async ({ interaction, player }) => {
  const queue: Track[] = player.queue;

  if (!queue.length) {
    return interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setDescription("[ The queue is empty. ]")
          .setColor(embedColor),
      ], ephemeral: true
    });
  }

  let queueEntries: string[] = [];
  let queueLength: number = 0;

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    queueLength += entry.info.length;

    queueEntries.push(
      `\`${i + 1}\`: **[${entry.info.title} - ${entry.info.author}](${entry.info.uri
      })**\nAdded by <@${entry.info.requester.id
      }> | Duration: \`${formatSeconds(entry.info.length / 1000)}\`\n\n`
    );
  }

  let splitter = 6;

  if (queue.length > splitter) {
    let embeds: EmbedBuilder[] = [];

    for (let i = 0; i < queueEntries.length; i += splitter) {
      const arraySlice = queueEntries.slice(i, i + splitter);

      let description = "";

      for (let part of arraySlice) {
        description += part;
      }

      const toPush = new EmbedBuilder()
        .setAuthor({
          name: `[ There are ${queueEntries.length} songs in the queue. ]`,
        })
        .setDescription(description);

      embeds.push(toPush);
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

    const res = await interaction.followUp({
      embeds: [
        embeds[page].setFooter({
          text: `Page 1/${embeds.length} • Queue length: ${formatSeconds(
            queueLength / 1000
          )}`,
        }),
      ], ephemeral: true,
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

      button.editReply({
        embeds: [
          embeds[page].setFooter({
            text: `Page ${page + 1}/${embeds.length
              } • Queue length: ${formatSeconds(queueLength / 1000)}`,
          }),
        ],
      });
    });

    collector.on("end", async (c) => {
      const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttons[0].setDisabled(true),
        buttons[1].setDisabled(true)
      );

      try {
        await interaction.editReply({ components: [newRow] });
      } catch (error) {
        log.error(
          `Failed to remove buttons from player audit log message: ${error}`
        );
      }
    });
  } else {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: `There are ${queue.length} songs in the queue` })
          .setDescription(queueEntries.join("\n"))
          .setColor(embedColor),
      ],
    });
  }
};
