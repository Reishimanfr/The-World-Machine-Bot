import { CommandInteraction, ComponentType, EmbedBuilder } from 'discord.js';
import util from '../../misc/Util';
import { confirmButtons, finalConButtons } from './stUtil';
import { starboardEmojis } from '../../types/database_definition';

export default async function emojiCon(interaction: CommandInteraction) {
  const oldEmojis = await starboardEmojis.findAll({ where: { guildId: interaction.guildId } });
  const emojis = oldEmojis.map((d) => d.dataValues.emoji);

  console.log(emojis);

  const embeds = [
    new EmbedBuilder()
      .setDescription(`[ The current emojis are set to ${emojis.join(', ')}. ]`)
      .setColor(util.twmPurpleHex),

    new EmbedBuilder()
      .setDescription(`[ Sure! The emojis will stay the same. ]`)
      .setColor(util.twmPurpleHex),

    new EmbedBuilder()
      .setDescription(`[ Input the new emojis separated by (,) here... ]`)
      .setColor(util.twmPurpleHex),

    new EmbedBuilder()
      .setDescription(`[ The amount must be a number! ]`)
      .setColor(util.twmPurpleHex),
  ];

  const res = await interaction.editReply({
    embeds: [embeds[0]],
    components: [confirmButtons],
  });

  const collector = await res.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 60000,
  });

  await collector.deferUpdate();
  const value = collector.customId;

  if (value == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    });
  }

  await interaction.editReply({
    embeds: [embeds[2]],
    components: [],
  });

  const sel = await interaction.channel?.awaitMessages({
    max: 1,
    time: 60000,
    filter: (u) => u.author.id === interaction.user.id, // Only accept messages from the command initiator
  });

  const content = sel?.at(0)?.content;

  if (!content) return;

  const newEmojis = content
    .split(', ')
    .map((emj) => emj.trim())
    .filter((emj) => emj.match(/\p{Emoji}/gu) || emj.match(/<(a|):(.*):(.*?)>/gu));

  const finalCon = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ The new emojis will be set to ${newEmojis.join(', ')}. Confirm? ]`)
        .setColor(util.twmPurpleHex),
    ],
    components: [finalConButtons],
  });

  const finalCollected = await finalCon.awaitMessageComponent({
    componentType: ComponentType.Button,
    time: 6000,
  });

  await finalCollected.deferUpdate();
  const finalBtn = finalCollected.customId;

  if (finalBtn == 'deny') {
    return interaction.editReply({
      embeds: [embeds[1]],
      components: [],
    });
  }

  interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(`[ Done! The new emojis have been set to **${newEmojis.join(', ')}**. ]`)
        .setColor(util.twmPurpleHex),
    ],
    components: [],
  });

  await starboardEmojis.destroy({ where: { guildId: interaction.guildId } });

  let data: { guildId: string; emoji: string }[] = [];

  for (const e of newEmojis) {
    data.push({
      guildId: interaction.guild!.id,
      emoji: e,
    });
  }

  await starboardEmojis.bulkCreate(data);
}
