import dayjs from 'dayjs';
import { ColorResolvable, GuildMember, User } from 'discord.js';
import { client } from '..';
import { ExtPlayer } from './ExtendedClient';

class util {
  static sliceIfTooLong(
    string: string,
    maxLength: number = 1023,
    sliceLength: number = 3,
    sliceEnd: string = '...'
  ): string {
    if (string.length < maxLength) return string;

    return string.slice(0, string.length - sliceLength) + sliceEnd;
  }

  static wrapString(string: string, maxLength: number) {
    if (string.length <= maxLength) return string;

    let wrappedString = '';
    for (let i = 0; i < string.length; i += maxLength) {
      wrappedString += string.substring(i, i + maxLength) + '\n';
    }

    return wrappedString.trim();
  }

  static async fetchMember(guildId: string, userId: string): Promise<GuildMember> {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);

    return member;
  }

  static addToAuditLog(player: ExtPlayer, user: User, message: string) {
    const newData = {
      date: dayjs(),
      user: user,
      func: message,
    };

    player.auditLog = player.auditLog ? [...player.auditLog, newData] : [newData];
  }

  static playerGifUrl =
    'https://media.discordapp.net/attachments/968786035788120099/1134526510334738504/niko.gif';

  static embedColor: ColorResolvable = '#8b00cc';
}

export default util;
