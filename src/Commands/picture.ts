import axios from 'axios';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import util from '../Helpers/Util';
import Command from '../types/Command';

async function getImage(link: string) {
  const request = await axios.get(link);
  const data = request.data;

  return data.image || data.data.url; // Depending on which api we're using
}

const picture: Command = {
  permissions: ['SendMessages'],
  data: new SlashCommandBuilder()
    .setName('picture')
    .setDescription('Get a random picture of a selected animal')
    .addStringOption((animal) =>
      animal
        .setName('animal')
        .setDescription('Animal of your choosing')
        .addChoices(
          { name: 'Bird', value: 'bird' },
          { name: 'Cat', value: 'cat' },
          { name: 'Capybara', value: 'capy' },
          { name: 'Dog', value: 'dog' },
          { name: 'Fox', value: 'fox' },
          { name: 'Kangaroo', value: 'kangaroo' },
          { name: 'Koala', value: 'koala' },
          { name: 'Panda', value: 'panda' },
          { name: 'Raccoon', value: 'raccoon' },
          { name: 'Red Panda', value: 'red_panda' }
        )
        .setRequired(true)
    )
    .addBooleanOption((secret) =>
      secret
        .setName('secret')
        .setDescription('Should you be the only one seeing the command reply?')
    ),

  callback: async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.inCachedGuild()) return;

    const choice = interaction.options.getString('animal');
    const secret = interaction.options.getBoolean('secret') ?? false;

    // Depending on the choice prepare the link to be used in the getImage function
    const link: string =
      choice === 'capy'
        ? 'https://api.capy.lol/v1/capybara?json=true'
        : `https://some-random-api.com/animal/${choice}`;

    const image = await getImage(link);

    const embed = new EmbedBuilder()
      .setImage(image) // Get and set the image
      .setColor(util.embedColor);

    // The reason we use a array is so we can edit the .setDisabled value of the button once the interaction expires
    const components = [
      new ButtonBuilder()
        .setCustomId('get-another')
        .setLabel('🔃')
        .setStyle(ButtonStyle.Secondary),
    ];

    const enabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      components
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [enabledRow],
      ephemeral: secret,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', async (button) => {
      await button.deferUpdate();
      collector.resetTimer();

      const image = await getImage(link);

      const newEmbed = new EmbedBuilder()
        .setImage(image) // Get set image
        .setColor(util.embedColor);

      try {
        await reply.edit({ embeds: [newEmbed] });
      } catch { }
    });

    collector.on('end', async (_) => {
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        components[0].setDisabled(true)
      );

      try {
        await reply.edit({ components: [disabledRow] });
      } catch { }
    });
  },
};

export default picture;
