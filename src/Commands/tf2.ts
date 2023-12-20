import axios from 'axios';
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  EmbedField,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { ITf2Stats, classIconEmoji, classIconObject, classes, statFields } from '../Funcs/Tf2Data';
import { embedColor } from '../Helpers/Util';
import { config } from '../config';
import Command from '../types/Command';

const token = config.apiKeys.steam;

const urls = {
  vanityRequestUrl: `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=`,
  tf2: `http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=440&key=${token}&steamid=`,
  profile: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=`,
};

async function findSteamID(steamId: string) {
  // If provided steam id is already a valid number just return it
  if (parseInt(steamId)) return steamId;

  let vanity = steamId;

  if (vanity.startsWith('https://steamcommunity.com/')) {
    vanity = steamId.split('/')[4];
  }

  if (!!parseInt(vanity)) return vanity;

  const vanityRequest = await axios.get(urls.vanityRequestUrl + vanity);
  return vanityRequest.data.response.steamid;
}

async function requestData(dataType: 'tf2' | 'profile', steamId: string) {
  const request = await axios.get(urls[dataType] + steamId);
  if (dataType == 'tf2') return request.data.playerstats.stats;
  else return request.data.response.players[0];
}

function filterTf2Data(data, playerClass) {
  const onlyClassesData = data.filter((object) => {
    return classes.some((name) => object.name.startsWith(name));
  });

  const playerClassOnlyData = onlyClassesData.filter((object) => object.name.startsWith(playerClass));

  const dataObject = playerClassOnlyData.reduce((acc, obj, index) => {
    if (index === 0) {
      acc = { [obj.name]: obj.value };
    } else {
      acc[obj.name] = obj.value;
    }
    return acc;
  }, {});

  const accum: ITf2Stats = {};
  const max: ITf2Stats = {};

  for (const property in dataObject) {
    const type = property.split('.')[1];
    const modRegExp = new RegExp(`${playerClass}|max|accum|\\.`, 'gi');
    const modProperty = property.replace(modRegExp, '');

    if (type === 'accum') {
      accum[modProperty] = dataObject[property];
    } else if (type === 'max') {
      max[modProperty] = dataObject[property];
    }
  }

  return [accum, max];
}

function createMenuRow(customId: string = 'select-menu-tf2-stats'): ActionRowBuilder<StringSelectMenuBuilder> {
  const menuOptions: StringSelectMenuOptionBuilder[] = [];

  for (const tf_class of classes) {
    const optionToPush = new StringSelectMenuOptionBuilder().setLabel(tf_class).setValue(tf_class);

    if (classIconEmoji[tf_class]) {
      optionToPush.setEmoji(classIconEmoji[tf_class]);
    }

    menuOptions.push(optionToPush);
  }

  const menu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder('Select a class')
      .addOptions(...menuOptions),
  );

  return menu;
}

function createStatField(name: string, overall: number, max: number) {
  return {
    name: name,
    value: `> **Overall** ${overall ?? 0}\n> **Max** ${max ?? 0}`,
    inline: name == 'Playtime' ? false : true,
  };
}

function generateEmbed(tf2Data, playerClass, profileData, command) {
  const [accum, max] = filterTf2Data(tf2Data, playerClass);

  const fields = statFields.reduce((accumulated: EmbedField[], fieldData) => {
    if (fieldData.playerClass) {
      if (fieldData.playerClass == playerClass) {
        accumulated.push(createStatField(fieldData.title, accum[fieldData.stat], max[fieldData.stat]));
      }
    } else {
      accumulated.push(createStatField(fieldData.title, accum[fieldData.stat], max[fieldData.stat]));
    }

    return accumulated;
  }, []);

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Stats as ${playerClass} • ${profileData.personaname}`,
      iconURL: classIconObject[playerClass],
    })
    .setThumbnail(profileData.avatarfull)
    .setTitle('[Link to steam profile]')
    .setURL(profileData.profileurl)
    .addFields(...fields)
    .setFooter({
      text: `${command.user.tag}`,
      iconURL: command.user.displayAvatarURL(),
    })
    .setColor(embedColor)
    .setTimestamp();

  return embed;
}

export default <Command>{
  data: new SlashCommandBuilder()
    .setName('tf2')
    .setDescription('Get tf2 stats for a player')
    .addStringOption((id_option) =>
      id_option.setName('steam-id-or-url').setDescription('Steam ID or profile url of user').setRequired(true),
    ),

  callback: async ({ interaction }) => {
    if (!token) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ Error: Missing steam API key. ]')
            .setColor(embedColor)],
      });
    }

    await interaction.deferReply(); // To get more time in case the API takes some time to respond

    const steamId = await findSteamID(interaction.options.getString('steam-id-or-url', true));

    const [tf2Data, profileData] = await Promise.all([requestData('tf2', steamId), requestData('profile', steamId)]);

    if (!tf2Data) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("[ Can't find anything for this steam Id. ]")
            .setColor(embedColor),
        ],
      });
    }

    const menu = createMenuRow();
    const firstEmbed = generateEmbed(tf2Data, 'Scout', profileData, interaction);

    const response = await interaction.editReply({
      embeds: [firstEmbed],
      components: [menu],
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120000,
    });

    collector.on('collect', async (collected) => {
      await collected.deferUpdate();
      collector.resetTimer();

      const playerClass = collected.values[0];
      const embed = generateEmbed(tf2Data, playerClass, profileData, interaction);

      interaction.editReply({ embeds: [embed], components: [menu] });
      return;
    });

    collector.on('end', (_) => {
      interaction.editReply({ components: [] }).catch(() => { }); // Ignore the error since we can't do anything about it
    });
  },
}