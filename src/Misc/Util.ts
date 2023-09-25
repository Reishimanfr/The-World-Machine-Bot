import { ColorResolvable, GuildMember } from 'discord.js';
import { client } from '..';

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

  static async fetchMember(guildId: string, userId: string): Promise<GuildMember> {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);

    return member;
  }

  static nikoGifUrl =
    'https://media.discordapp.net/attachments/968786035788120099/1134526510334738504/niko.gif';

  static twmPurpleHex: ColorResolvable = '#8b00cc';
}

export default util;
