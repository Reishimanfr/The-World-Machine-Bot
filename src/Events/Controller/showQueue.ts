import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import { Track } from 'poru';
import util from '../../misc/Util';
import { logger } from '../../misc/logger';
import { formatSeconds } from '../../bot_data/formatSeconds';

export const showQueue = async (
  interaction: ButtonInteraction,
  player: ExtPlayer
) => {
  const queue: Track[] = player.queue;

  if (!queue.length) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ The queue is empty. ]')
          .setColor(util.twmPurpleHex),
      ],
      ephemeral: true,
    });
  }

  let queueEntries: string[] = [];
  let queueLength: number = 0;

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    queueLength += entry.info.length;

    queueEntries.push(
      `\`${i + 1}\`: **[${entry.info.title} - ${entry.info.author}](${
        entry.info.uri
      })**\nAdded by <@${entry.info.requester?.user
        .id}> | Duration: \`${formatSeconds(
        Math.trunc(entry.info.length / 1000)
      )}\`\n\n`
    );
  }

  let splitter = 6;

  if (queue.length > splitter) {
    let embeds: EmbedBuilder[] = [];
    let idx = 0;

    for (let i = 0; i < queueEntries.length; i += splitter) {
      const arraySlice = queueEntries.slice(i, i + splitter);
      idx++;

      let description = '';

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
        .setCustomId('back')
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('forward')
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Primary),
    ];

    const components = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    let page = 0;

    const res = await interaction.editReply({
      embeds: [
        embeds[page].setFooter({
          text: `Page 1/${embeds.length} • Queue length: ${formatSeconds(
            Math.trunc(queueLength / 1000)
          )}`,
        }),
      ],
      components: [components],
    });

    const collector = res.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', async (button) => {
      await button.deferUpdate();
      collector.resetTimer();

      if (button.customId == 'back') {
        page = page > 0 ? --page : embeds.length - 1;
      } else if (button.customId == 'forward') {
        page = page + 1 < embeds.length ? ++page : 0;
      }

      res.edit({
        embeds: [
          embeds[page].setFooter({
            text: `Page ${page + 1}/${embeds.length} • Queue length: ${formatSeconds(
              Math.trunc(queueLength / 1000)
            )}`,
          }),
        ],
      });
    });

    collector.on('end', async (_) => {
      const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttons[0].setDisabled(true),
        buttons[1].setDisabled(true)
      );

      try {
        await res.edit({ components: [newRow] });
      } catch (error) {
        logger.error(
          `Failed to remove buttons from player audit log message: ${error.stack}`
        );
      }
    });
  } else {
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: `There are ${queue.length} songs in the queue` })
          .setDescription(queueEntries.join('\n'))
          .setColor(util.twmPurpleHex),
      ],
    });
  }
};
