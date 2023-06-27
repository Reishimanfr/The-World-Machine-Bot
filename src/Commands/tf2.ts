import { ActionRowBuilder, ChatInputCommandInteraction, Colors, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import Command from '../Interfaces/Command';
import axios from 'axios';
import { StatInterface, classIconEmoji, classIconObject, classes, classesType } from '../Misc/Tf2Data';
import { logger } from '../Misc/logger';

const urls = {
    vanityRequestUrl: `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=`,
    tf2: `http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=440&key=${process.env.STEAM_API_KEY}&steamid=`,
    profile: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=`,
};

async function findSteamID(steamId: string) {
    const isNumber = !!parseInt(steamId);

    if (!isNumber) {
        let vanity = steamId;

        if (vanity.startsWith('https://steamcommunity.com/')) {
            vanity = steamId.split('/')[4];
        }

        if (!!parseInt(vanity)) return vanity;

        const vanityRequest = await axios.get(urls.vanityRequestUrl + vanity);
        return vanityRequest.data.response.steamid;
    }

    return steamId;
};

async function requestData(dataType: 'tf2' | 'profile', steamId: string) {
    const request = await axios.get(urls[dataType] + steamId);
    return request.data;
}

function filterTf2Data(data, playerClass: classesType) {
    const onlyClassesData = data.filter(object => {
        return classes.some(name => object.name.startsWith(name));
    });

    const playerClassOnlyData = onlyClassesData.filter(object => object.name.startsWith(playerClass));

    const dataObject = playerClassOnlyData.reduce((acc, obj, index) => {
        if (index === 0) {
            acc = { [obj.name]: obj.value };
        } else {
            acc[obj.name] = obj.value;
        }
        return acc;
    }, {});

    const accum: StatInterface = {};
    const max: StatInterface = {};

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

function createMenuRow(): any {
    const menuOptions = [];

    for (const tf_class of classes) {
        menuOptions.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(tf_class)
                .setValue(tf_class)
                .setEmoji(classIconEmoji[tf_class] || '❌')
        );
    };

    const classSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select-menu-tf2-stats')
                .setPlaceholder('Select a class')
                .addOptions(...menuOptions)
        );

    return classSelectMenu;
}

export const tf2: Command = {
    permissions: ['SendMessages'],

    data: new SlashCommandBuilder()
        .setName('tf2')
        .setDescription('Get tf2 stats for a player')
        .addStringOption(id_option => id_option
            .setName('steam-id')
            .setDescription('Steam ID of user')
            .setRequired(true)
        ),

    run: async (command: ChatInputCommandInteraction) => {

        if (!process.env.STEAM_API_KEY) {
            command.reply({ embeds: [{ description: 'This command will not work, because the steam API key is missing!', color: Colors.Red }] });
            logger.warn('[Commands/tf2.ts]: Command tf2 will not work: missing steam API key.');
            return;
        }

        await command.deferReply(); // To get more time in case the API takes some time to respond

        const steam_id = await findSteamID(command.options.getString('steam-id'));

        const raw_tf2_data = await requestData('tf2', steam_id);
        const tf2Data = raw_tf2_data.playerstats.stats;

        const raw_profile_data = await requestData('profile', steam_id);
        const profileData = raw_profile_data.response.players[0];

        if (!tf2Data) {
            command.editReply({ embeds: [{ description: 'Can\'t find anything for this steam ID!', color: Colors.Red }] });
        }

        const classSelectMenu = await createMenuRow();

        const response = await command.editReply({ embeds: [{ description: 'test' }], components: [classSelectMenu] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 120000 });

        collector.on('collect', async collected => {
            await collected.deferUpdate();
            collector.resetTimer();

            const playerClass = collected.values[0];

            const [accum, max] = filterTf2Data(tf2Data, playerClass);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Stats as ${playerClass} • ${profileData.personaname}`, iconURL: classIconObject[playerClass] })
                .setThumbnail(profileData.avatarfull)
                .setTitle('[Link to steam profile]')
                .setURL(profileData.profileurl)
                .addFields(
                    {
                        name: 'Playtime',
                        value: `> ${(accum.iPlayTime / 3600).toFixed(0) || 0}h ${((accum.iPlayTime % 3600) / 60).toFixed(0) || 0}min`,
                    },
                    {
                        name: 'Points scored',
                        value: `> **Overall** ${accum.iPointsScored ?? 0}\n> **Max** ${max.iPointsScored ?? 0}`,
                        inline: true,
                    },
                    ...(playerClass === 'Medic' ? [{ name: 'ÜberCharges', value: `> **Overall** ${accum.iNumInvulnerable ?? 0}\n> **Max** ${max.iNumInvulnerable ?? 0}`, inline: true }] : []),
                    ...(playerClass === 'Medic' ? [{ name: 'Healing', value: `> **Overall** ${accum.iHealthPointsHealed ?? 0}\n> **Max** ${max.iHealthPointsHealed ?? 0}`, inline: true }] : []),
                    {
                        name: 'Kills',
                        value: `> **Overall** ${accum.iNumberOfKills ?? 0}\n> **Max** ${max.iNumberOfKills ?? 0}`,
                        inline: true,
                    },
                    ...(playerClass === 'Engineer' ? [{ name: 'Kills with sentry', value: `>**Overall** [Unavailable]\n> **Max** ${max.iSentryKills ?? 0}`, inline: true }] : []),
                    ...(playerClass === 'Spy' ? [{ name: 'Backstabs', value: `> **Overall** ${accum.iBackstabs ?? 0}\n> **Max** ${max.iBackstabs ?? 0}`, inline: true }] : []),
                    ...(['Spy', 'Sniper'].includes(playerClass) ? [{ name: 'Headshots', value: `> **Overall** ${accum.iHeadshots ?? 0}\n> **Max** ${max.iHeadshots ?? 0}`, inline: true }] : []),
                    ...(playerClass === 'Engineer' ? [{ name: 'Buildings built', value: `> **Overall** ${accum.iBuildingsBuilt ?? 0}\n> **Max** ${max.iBuildingsBuilt ?? 0}`, inline: true }] : []),
                    {
                        name: 'Assists',
                        value: `> **Overall** ${accum.iKillAssists ?? 0}\n> **Max** ${max.iKillAssists ?? 0}`,
                        inline: true,
                    },
                    {
                        name: 'Damage',
                        value: `> **Overall** ${accum.iDamageDealt ?? 0}\n> **Max** ${max.iDamageDealt ?? 0}`,
                        inline: true,
                    },
                    {
                        name: 'Dominations',
                        value: `> **Overall** ${accum.iDominations ?? 0}\n> **Max** ${max.iDominations ?? 0}`,
                        inline: true,
                    },
                    {
                        name: 'Revenges',
                        value: `> **Overall** ${accum.iRevenge ?? 0}\n> **Max** ${max.iRevenge ?? 0}`,
                        inline: true,
                    },
                    {
                        name: 'Captures',
                        value: `> **Overall** ${accum.iPointCaptures ?? 0}\n> **Max** ${max.iPointCaptures ?? 0}`,
                        inline: true,
                    },
                    {
                        name: 'Defenses',
                        value: `> **Overall** ${accum.iPointDefenses ?? 0}\n> **Max** ${max.iPointDefenses ?? 0}`,
                        inline: true,
                    },
                    {
                        name: 'Destructions',
                        value: `> **Overall** ${accum.iBuildingsDestroyed ?? 0}\n> **Max** ${max.iBuildingsDestroyed ?? 0}`,
                        inline: true,
                    },
                )
                .setFooter({ text: `${command.user.tag}`, iconURL: command.user.displayAvatarURL() })
                .setTimestamp();

            command.editReply({ embeds: [embed], components: [classSelectMenu] });
            // }
        });

        collector.on('end', _ => {
            command.editReply({ components: [] })
                .catch(error => logger.error(error.stack));
        });
    },
};