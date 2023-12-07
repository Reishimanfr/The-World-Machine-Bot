import { GuildMember } from "discord.js";
import { client } from "..";

/** Fetches a member from a guild */
export async function fetchMember(guildId: string, userId: string): Promise<GuildMember | undefined> {
  const guild = await client.guilds.fetch(guildId);

  if (!guild) return undefined

  return await guild.members.fetch(userId)
}