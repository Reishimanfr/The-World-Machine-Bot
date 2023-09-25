import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Colors,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import Command from '../types/CommandI';
import { starboardConfig, starboardEmojis } from '../types/database_definition';
import { logger } from '../misc/logger';

async function updateRecord(
  targetGuildId: string,
  newBoardId: string,
  newAmount: number,
  newEmojis: string[]
): Promise<void> {
  await starboardConfig.update(
    {
      boardId: newBoardId,
      amount: newAmount,
      emoji: newEmojis,
    },
    { where: { guildId: targetGuildId } }
  );
}

async function destroyStarboardEmojis(targetGuildId: string) {
  await starboardEmojis.destroy({ where: { guildId: targetGuildId } });
}

async function createStarboardEmojis(targetGuildId: string, newEmojis: string[]) {
  const emojiPromises = newEmojis.map((emoji) => {
    starboardEmojis.create({
      guildId: targetGuildId,
      emoji: emoji,
    });
  });

  Promise.all(emojiPromises);
}

const starboard: Command = {
  permissions: ['EmbedLinks', 'SendMessages', 'ViewChannel'],
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Configure a starboard')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Make the commands vibisle only to admins
    .addSubcommand((channelConfig) =>
      channelConfig
        .setName('board-channel')
        .setDescription('Configure where the starboard should be')
        .addChannelOption((channel) =>
          channel
            .setName('channel')
            .setDescription('Channel to set as a starboard')
            .setRequired(true)
        )
    )
    .addSubcommand((amountConfig) =>
      amountConfig
        .setName('amount')
        .setDescription(
          '[Default: 4] Amount of emoji reactions for the message to be sent in the starboard'
        )
        .addNumberOption((number) =>
          number
            .setName('amount')
            .setDescription('Amount of reactions required')
            .setMinValue(2)
            .setRequired(true)
        )
    )
    .addSubcommand((emojiConfig) =>
      emojiConfig
        .setName('emoji')
        .setDescription('[Default: ⭐] Emoji(s) to be used for the starboard')
        .addStringOption((emoji) =>
          emoji
            .setName('emoji')
            .setDescription('Emoji(s) to be used for the starboard')
            .setRequired(true)
        )
    )
    .addSubcommand((blacklist) =>
      blacklist
        .setName('blacklist-channel')
        .setDescription('Blacklist (or whitelist if already blacklisted) a channel.')
        .addChannelOption((channel) =>
          channel
            .setName('channel')
            .setDescription('Channel to be set as blacklisted.')
            .setRequired(true)
        )
    ),

  callback: async (interaction: ChatInputCommandInteraction) => {
    const [[record], oldEmojiData] = await Promise.all([
      starboardConfig.findOrCreate({
        where: { guildId: interaction.guildId },
        defaults: { guildId: interaction.guildId, boardId: null, amount: 4 },
      }),
      starboardEmojis.findAll({
        where: { guildId: interaction.guildId },
      }),
    ]);

    let oldEmojis = oldEmojiData.map((obj) => obj.getDataValue('emoji'));

    if (oldEmojis.length >= 0) {
      oldEmojis = ['⭐'];
    }

    const channel =
      interaction.options.getChannel('channel')?.id ??
      record.getDataValue('boardId');
    const amount =
      interaction.options.getNumber('amount') ?? record.getDataValue('amount');

    const intEmoji = interaction.options.getString('emoji');
    let emoji: string[];

    if (intEmoji) {
      emoji = intEmoji
        .split(',')
        .map((emj) => emj.trim())
        .filter(
          (emj) => emj.match(/\p{Emoji}/gu) || emj.match(/<(a|):(.*):(.*?)>/gu)
        );
    } else {
      emoji = oldEmojis;
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setAuthor({
        name: '[ Confirm new configuration? ]',
        iconURL: interaction.guild?.iconURL() ?? undefined,
      })
      .addFields(
        {
          name: 'Board channel:',
          value: `${
            channel
              ? `<#${channel ?? 'hell'}>`
              : "⚠️  Channel hasn't been setup yet. The starboard won't work without it!"
          }`,
          inline: false,
        },
        {
          name: 'Emoji(s):',
          value: `${emoji.join(', ') ?? 'No emojis'}`,
          inline: false,
        },
        {
          name: 'Amount:',
          value: `${amount ?? 'null'} reaction(s)`,
          inline: false,
        }
      );

    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('discard')
        .setLabel('Discard')
        .setStyle(ButtonStyle.Danger)
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [buttonRow],
      ephemeral: true,
    });
    const collected = await reply.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 60000,
    });

    await collected.deferUpdate();

    try {
      if (collected.customId == 'discard') {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription('[ Discarding changes. ]')
              .setColor('#8b00cc'),
          ],
          components: [],
        });
      }

      await updateRecord(interaction!.guild!.id, channel, amount, emoji);

      if (emoji !== oldEmojis) {
        Promise.all([
          destroyStarboardEmojis(interaction!.guild!.id),
          createStarboardEmojis(interaction!.guild!.id, emoji),
        ]);
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Configuration saved. ]')
            .setColor('#8b00cc'),
        ],
        components: [],
      });
    } catch (error) {
      logger.error(`Error while saving starboard configuration: ${error.stack}`);

      const replyContent = error.message.endsWith('time')
        ? '[ The command expired. Discarding changes. ]'
        : '[ There was a error while running the command. Discarding changes. ]';

      await interaction.editReply({
        embeds: [
          new EmbedBuilder().setDescription(replyContent).setColor('#8b00cc'),
        ],
        components: [],
      });
    }
  },
};

export default starboard;
