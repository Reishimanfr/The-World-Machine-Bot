import { ColorResolvable, Colors, EmbedBuilder, GuildMember, User } from 'discord.js';
import { client } from '..';
import { ExtPlayer } from './ExtendedClient';
import { botConfigOptions } from './DatabaseSchema';

type optionsType = {
  message: string,
  stackTrace: string,
  level: 'warn' | 'error',
  guildId: string
}

class util {
  /**
   * Clips a string to a maximum length and appeds a string provided by the sliceEnd paratemer
   * @param string The string input
   * @param maxLength Max length of the string (defaults to 1023 which is Discord's max description field length)
   * @param sliceEnd Substring to append to the end of the clipped string (defaults to "...")
   * @returns The clipped string
   */
  static clipString(
    string: string,
    maxLength: number = 1023,
    sliceEnd: string = '...'
  ): string {
    if (string.length < maxLength) return string;

    return string.slice(0, string.length - sliceEnd.length || 3) + sliceEnd || '';
  }

  static wrapString(string: string, maxLength: number) {
    if (string.length <= maxLength) return string;

    let wrappedString = '';
    for (let i = 0; i < string.length; i += maxLength) {
      wrappedString += string.substring(i, i + maxLength) + '\n';
    }

    return wrappedString.trim();
  }

  /**
   * Fetches a member from a guild
   * @param guildId Id of the guild
   * @param userId Id of the user
   * @returns The guild member object
   */
  static async fetchMember(guildId: string, userId: string): Promise<GuildMember> {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);

    return member;
  }

  static addToAuditLog(player: ExtPlayer, user: User, message: string) {
    const newData = {
      date: new Date(),
      user: user,
      func: message,
    };

    player.auditLog = player.auditLog ? [...player.auditLog, newData] : [newData];
  }

  /**
   * Sends a message to the guild's error log channel if error is fixable without code changes
   */
  static async sendAdminErrorMsg(options: optionsType) {
    const targetChannel = await botConfigOptions.findOne({ where: { guildId: options.guildId } })
    const errorLogChannel = await targetChannel?.getDataValue('errorLogs')

    // Return if there's no channel data
    if (!errorLogChannel) return;

    const guild = await client.guilds.fetch(options.guildId)
    const channel = await guild.channels.fetch(errorLogChannel)

    // Return if channel doesn't exist, is not text based or we can't talk in it
    if (
      !channel
      || !channel.isTextBased()
      || !channel.permissionsFor(client.user!.id)?.has('SendMessages')
    ) return;

    const colors = {
      'warn': Colors.Yellow,
      'error': Colors.DarkRed
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Level: ${options.level}\nStack trace: ${options.stackTrace}` })
      .setDescription(options.message)
      .setColor(colors[options.level])
      .setTimestamp()

    await channel.send({
      embeds: [embed]
    })
  }

  static playerGifUrl = 'https://media.discordapp.net/attachments/968786035788120099/1134526510334738504/niko.gif';
  static embedColor: ColorResolvable = '#8b00cc';
}

export default util;
