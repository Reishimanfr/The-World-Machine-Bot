import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, ComponentType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Command from "../Interfaces/Command";
import { logger } from "../Misc/logger";
import { starboardConfig, starboardEmojis } from "../Interfaces/Models";

export const starboard: Command = {
    permissions: ['EmbedLinks', 'SendMessages'],

    data: new SlashCommandBuilder()
        .setName('starboard')
        .setDescription('Configure a starboard')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(boardChannel => boardChannel
            .setName('board-channel')
            .setDescription('Configure where the starboard should be')
            .addChannelOption(channel => channel
                .setName('channel')
                .setDescription('Channel to set as a starboard')
                .setRequired(true)
            )
        )
        .addSubcommand(amount => amount
            .setName('amount')
            .setDescription('[Default: 4] Amount of emoji reactions for the message to be sent in the starboard')
            .addNumberOption(number => number
                .setName('amount')
                .setDescription('Amount of reactions required')
                .setRequired(true)
            )
        )
        .addSubcommand(emoji => emoji
            .setName('emoji')
            .setDescription('[Default: ⭐] Emoji(s) to be used for the starboard')
            .addStringOption(emoji => emoji
                .setName('emoji')
                .setDescription('Emoji(s) to be used for the starboard')
                .setRequired(true)
            )
        ),

    run: async (command: ChatInputCommandInteraction) => {

        const [record] = await starboardConfig.findOrCreate({
            where: { guildId: command.guildId },
            defaults: { guildId: command.guildId, boardId: '', amount: 4 }
        });

        const { options } = command;
        const { dataValues } = record

        const getChannel = options.getChannel('channel') ?? null;
        const getAmount = options.getNumber('amount') ?? null;
        const getEmoji = options.getString('emoji') ?? null;
        const emojiList = getEmoji ? [...getEmoji].filter(e => e.match(/\p{Emoji}/gu)) : [];
        
        const emojis = (await starboardEmojis.findAll({ where: { guildId: command.guildId } })).map(o => o.dataValues.emoji) || ['⭐'];

        let boardId = getChannel?.id ?? dataValues.boardId;
        let amount = getAmount ?? dataValues.amount;
        let emoji = emojiList.length ? emojiList : emojis;

        const embed = new EmbedBuilder()
            .setColor(boardId === '' ? Colors.Yellow : Colors.Blue)
            .setTitle('Confirm new configuration?')
            .addFields(
                { name: 'Board channel:', value: `${boardId === '' ? '⚠️  Channel hasn\'t been setup yet. Starboard won\'t work without it!' : `<#${boardId}>`}` },
                { name: 'Emoji:', value: `${emoji.join(', ')}` },
                { name: 'Amount:', value: `${amount} reaction(s)` },
            );

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('discard')
                    .setLabel('Discard')
                    .setStyle(ButtonStyle.Danger)
            );

        const reply = await command.reply({ embeds: [embed], components: [buttonRow], ephemeral: true });
        const collected = await reply.awaitMessageComponent({ componentType: ComponentType.Button, time: 60000 });

        const replies = {
            saved: {
                embeds: [
                    new EmbedBuilder()
                        .setDescription('✅  Configuration saved!')
                        .setColor(Colors.Green)
                ], components: []
            },
            discarding: {
                embeds: [
                    new EmbedBuilder()
                        .setDescription('ℹ️  Discarding changes.')
                        .setColor(Colors.Blue)
                ], components: []
            },
            expired: {
                embeds: [
                    new EmbedBuilder()
                        .setDescription('⚠️  The command has expired.')
                        .setColor(Colors.Yellow)
                ], components: []
            },
            error: {
                embeds: [
                    new EmbedBuilder()
                        .setDescription('❌  There was a error while running the command.')
                        .setColor(Colors.Red)
                ], components: []
            }
        };

        try {
            if (collected.customId === 'confirm') {
                await updateRecord(boardId, amount, emoji);

                if (emojis !== emoji) {
                    await destroyStarboardEmojis(command.guildId);
                    await createStarboardEmojis(command.guildId, emojiList);
                }

                command.editReply(replies['saved']);
            } else {
                command.editReply(replies['discarding']);
            }
        } catch (error) {
            logger.error(error.stack)
            command.editReply(replies[error.message.endsWith('time') ? 'expired': ' error'])
        }

        async function updateRecord(boardId: string, amount: number, emoji: string[]) {
            await record.update({
                boardId: boardId,
                amount: amount,
                emoji: emoji
            });
        }

        async function destroyStarboardEmojis(guildId: string) {
            await starboardEmojis.destroy({ where: { guildId: guildId } });
        }

        async function createStarboardEmojis(guildId: string, emojiList: string[]) {
            for (const emoji of emojiList) {
                await starboardEmojis.create({
                    guildId: guildId,
                    emoji: emoji
                });
            }
        }
    },
};
