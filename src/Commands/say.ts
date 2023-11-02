import {
  ActionRowBuilder,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Colors,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { logger } from '../Helpers/Logger';
import { generateTextbox } from '../functions/textboxGenerator';
import { OneshotSprites, OneshotSpritesType } from '../functions/textboxSprites';
import Command from '../types/Command';

const say: Command = {
  permissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make a oneshot character say whatever you want')
    .addStringOption((content) =>
      content
        .setName('message')
        .setDescription('Message for your character to say')
        .setRequired(true)
        .setMaxLength(150),
    ),

  callback: async (interaction: ChatInputCommandInteraction) => {
    const message = interaction.options.getString('message', true);
    let character: OneshotSpritesType;
    let characterChoices: StringSelectMenuOptionBuilder[] = [];

    for (const character in OneshotSprites) {
      characterChoices.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(character.replaceAll('_', ' '))
          .setValue(character)
          .setEmoji(OneshotSprites[character].Normal.id || '⚠️'),
      );
    }

    const characterSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('emotion-select-menu')
        .setPlaceholder('Select something!')
        .addOptions(characterChoices),
    );

    const characterResponse = await interaction.reply({
      embeds: [{ description: '[ Select a character. ]', color: Colors.DarkPurple }],
      components: [characterSelectMenu],
      ephemeral: true,
    });

    const characterCollector = await characterResponse.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60000,
      filter: (menu) => menu.user.id === interaction.user.id,
    });

    character = characterCollector.values[0] as OneshotSpritesType;
    await characterCollector.deferUpdate();

    let emotion: OneshotSpritesType;
    let emotionChoices: StringSelectMenuOptionBuilder[] = [];

    for (const sprite in OneshotSprites[character]) {
      emotionChoices.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(sprite.replaceAll('_', ' '))
          .setValue(sprite)
          .setEmoji(OneshotSprites[character][sprite].id || '⚠️'),
      );
    }

    const emotionSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('emotion-select-menu')
        .setPlaceholder('Select something!')
        .addOptions(emotionChoices),
    );

    const emotionResponse = await interaction.editReply({
      embeds: [
        {
          description: `[ Select a expression for **${character}** to show. ]`,
          color: Colors.DarkPurple,
        },
      ],
      components: [emotionSelectMenu],
    });

    const emotionCollector = await emotionResponse.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 60000,
      filter: (menu) => menu.user.id === interaction.user.id,
    });

    emotion = emotionCollector.values[0] as OneshotSpritesType;
    await emotionCollector.deferUpdate();

    try {
      const textboxBuffer = await generateTextbox(message, emotion, character);
      const attachment = new AttachmentBuilder(textboxBuffer, {
        name: 'textbox.png',
      });

      const requestedByEmbed = new EmbedBuilder().setAuthor({
        name: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

      interaction.channel?.send({
        files: [attachment],
        embeds: [requestedByEmbed],
      });
    } catch (error) {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`There was a error while generating a textbox: ${error}`)
            .setColor(Colors.Red),
        ],
      });
      logger.error(`Error while generating a oneshot textbox: ${error}\n(${character}) (${emotion})`);
    }
  },
};

export default say;
