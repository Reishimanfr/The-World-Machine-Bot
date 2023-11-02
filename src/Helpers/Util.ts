import { ColorResolvable, GuildMember, User } from 'discord.js';
import { client } from '..';
import { ExtPlayer } from './ExtendedClient';

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

  static playerGifUrl = 'https://media.discordapp.net/attachments/968786035788120099/1134526510334738504/niko.gif';
  static embedColor: ColorResolvable = '#8b00cc';
}

export default util;
