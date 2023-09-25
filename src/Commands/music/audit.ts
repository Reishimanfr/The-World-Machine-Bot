import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
} from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import { logger } from '../../misc/logger';
import util from '../../misc/Util';

export async function audit(
  interaction: ChatInputCommandInteraction,
  player: ExtPlayer
) {
  const auditLog = player?.auditLog;

  if (!auditLog?.length) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('[ There are no entries in the audit log. ]')
          .setColor(util.twmPurpleHex),
      ],
      ephemeral: true,
    });
  }

  auditLog.sort((a, b) => {
    const timeA = new Date(`2001-01-01 ${a.date.format('HH:mm:ss')}`);
    const timeB = new Date(`2001-01-01 ${b.date.format('HH:mm:ss')}`);
    return timeB.getTime() - timeA.getTime();
  });

  if (auditLog.length <= 10) {
    let description = '';

    for (let entry of auditLog) {
      description += `\`\`\`ansi\n[1;30m[${entry.date.format('hh:mm:ss')}] [0;31m${
        entry.user.username
      }: [0;34m${entry.func}\`\`\``;
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `[ There are ${auditLog.length} entries in the audit log. ]`,
          })
          .setDescription(description)
          .setColor(util.twmPurpleHex),
      ],
      ephemeral: true,
    });
  } else {
    const embeds: EmbedBuilder[] = [];
    let index = 0; // used for page footer

    for (let i = 0; i < auditLog.length; i += 10) {
      const arraySlice = auditLog.slice(i, i + 10);
      index++;

      let embedDescription: string = '';

      for (let part of arraySlice) {
        embedDescription += `\`\`\`ansi\n[1;30m[${part.date.format(
          'hh:mm:ss'
        )}] [0;31m${part.user.username}: [0;34m${part.func}\`\`\``;
      }

      const toPush = new EmbedBuilder()
        .setAuthor({
          name: `[ There are ${auditLog.length} entried in the audit log. ]`,
        })
        .setDescription(embedDescription)
        .setColor(util.twmPurpleHex);

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

    const res = await interaction.reply({
      embeds: [embeds[page].setFooter({ text: `Page 1/${embeds.length}` })],
      ephemeral: true,
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
          embeds[page].setFooter({ text: `Page ${page + 1}/${embeds.length}` }),
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
  }
}
