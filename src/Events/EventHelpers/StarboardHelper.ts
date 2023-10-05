import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  EmbedField,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { starboardConfig, starboardEmojis } from '../../types/database_definition';
import axios from 'axios';
import { logger } from '../../misc/logger';
import util from '../../misc/Util';
import { config } from '../../config';
import { client } from '../..';

const token = config.apiKeys.tenor;

interface IGuildConfig {
  guildId: string;
  boardId: string;
  amount: number;
}

type UserOrPartial = User | PartialUser;
type RectOrPartial = MessageReaction | PartialMessageReaction;

class Starboard {
  private user: UserOrPartial;
  private reaction: RectOrPartial;

  constructor(reaction: RectOrPartial, user: UserOrPartial) {
    this.user = user;
    this.reaction = reaction;
  }

  private setReferenceContent(reference: Message): string {
    // Roadmap:
    // 1: reply content
    // 2: reply embed description field
    // 3: reply attachments count
    // 4: error
    if (reference?.content) return util.sliceIfTooLong(reference.content);

    const refEmbeds = reference?.embeds;

    if (refEmbeds) {
      if (refEmbeds?.at(0)?.description) {
        return util.sliceIfTooLong(refEmbeds.at(0)?.description ?? '');
      }
    }

    if (reference?.attachments) {
      return `[ Reply contains (${reference.attachments.size}) attachments. ]`;
    }

    return '⚠️ Error getting message reference!';
  }

  private async setFields(): Promise<EmbedField[]> {
    const message = this.reaction.message;

    const fields: EmbedField[] = [
      {
        name: '✏️ Author:',
        value: `<@${message.author!.id}>`,
        inline: true,
      },
    ];

    if (message.reference) {
      const reference = await message.fetchReference();

      fields.push({
        name: '↩️ Replying to:',
        value: `${this.setReferenceContent(reference)}`,
        inline: false,
      });
    }

    if (message.content || message.attachments) {
      fields.push({
        name: '📄 Message:',
        value: `${this.setReferenceContent(message as Message)}`,
        inline: false,
      });
    }

    return fields;
  }

  private async getTenorGif(link: string): Promise<string | null> {
    const regex = /https:\/\/tenor.com\/view\/.+-(\d+)/;
    const id = link.match(regex)![1];

    const request = await axios
      .get(`https://api.tenor.com/v1/gifs?ids=${id}&key=${token}`)
      .catch((error) => logger.error(`Failed to fetch tenor gif in StarboardHelper.ts: ${error.stack}`));

    return request.data.results[0].media[0].gif.url || null;
  }

  private async getGuildData(guildId: string): Promise<[string[], IGuildConfig]> {
    const [guildEmojis, guildConfig] = await Promise.all([
      starboardEmojis
        .findAll({
          where: { guildId: guildId },
        })
        .then((o) => o.map((p) => p.getDataValue('emoji'))),

      starboardConfig.findOne({ where: { guildId: guildId } }).then((o) => o?.dataValues),
    ]);

    return [guildEmojis, guildConfig];
  }

  private async setEmbedImage(embed: EmbedBuilder): Promise<EmbedBuilder> {
    const message = this.reaction.message;

    const possibleLinks = message.content!.split(' ').filter(
      (part) =>
        part.startsWith('https://tenor.com') || // Tenor gifs
        part.startsWith('https://cdn.discordapp.com/attachments/') ||
        part.startsWith('https://media.discordapp.net/attachments'), // Discord att
    );

    // Try to embed any tenor links
    for (const link of possibleLinks) {
      if (link.startsWith('https://tenor.com')) {
        if (!token) {
          logger.warn("Can't fetch tenor gif: no tenor API key provided.");
          break;
        }

        const gifLink = await this.getTenorGif(link);

        embed.setImage(gifLink);
      }

      if (
        link.startsWith('https://cdn.discordapp.com/attachments/') ||
        link.startsWith('https://media.discordapp.net/attachments')
      ) {
        embed.setImage(link);
      }
    }

    if (message.attachments.size) {
      return embed.setImage(message.attachments.first()?.url!);
    }

    if (message?.embeds?.at(0)?.image?.url) {
      return embed.setImage(message.embeds.at(0)?.image?.url ?? null);
    }

    if (!possibleLinks?.length) return embed;

    return embed;
  }

  public async main() {
    const reaction = this.reaction.partial ? await this.reaction.fetch() : this.reaction;

    const [emojis, config] = await this.getGuildData(reaction.message.guild!.id);
    let reactionEmoji = reaction.emoji.name;
    const message = reaction.message;

    if (reaction.emoji.id) {
      const { emoji } = reaction;
      reactionEmoji = `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    }

    // Exit if there's no config or no channel config, since it's something we NEED for the command to work
    if (!config || !config?.boardId) return;
    if (reaction.message.channelId === config.boardId) return;
    if (reaction.message.author!.id === this.user.id) return;
    if (reactionEmoji && !emojis.includes(reactionEmoji)) return;

    let reactions: { emoji: string; count: number }[] = [];
    let reactionString: string[] = [];

    reaction.message.reactions.cache.forEach((rect) => {
      let emoji = rect.emoji.name;

      if (rect.emoji.id) {
        emoji = `<${rect.emoji.animated ? 'a' : ''}:${rect.emoji.name}:${rect.emoji.id}>`;
      }

      if (emoji && emojis.includes(emoji)) {
        reactions.push({ emoji: emoji, count: rect.count });
      }
    });

    // Return if there's not enough of any of the accepted reactions
    if (!reactions.some((rect) => rect.count >= config.amount)) return;

    const starboardChannel = await message.guild!.channels.fetch(config?.boardId);
    // The channel MUST be a text one to avoid errors and for typeguarding
    if (!starboardChannel || starboardChannel.type !== ChannelType.GuildText) return;

    reactions.sort((a, b) => b.count - a.count);

    for (const rect of reactions) {
      reactionString.push(`${rect.emoji}: ${rect.count}`);
    }

    const messages = await starboardChannel.messages.fetch({ limit: 100 });
    const starredMessage = messages.find(
      (m) => m.author.id == client.user?.id && m.embeds[0] && m.embeds[0].footer?.text.endsWith(message.id),
    );

    if (!starredMessage) {
      const message = reaction.message;
      const member = await util.fetchMember(message.guild!.id, message.author!.id);

      const embed = new EmbedBuilder()
        .setColor(member!.roles.highest.color)
        .setThumbnail(message.author!.displayAvatarURL())
        .setDescription(`${reactionString.join(' • ')}`)
        .addFields(await this.setFields())
        .setFooter({ text: `ID: ${message.id}` });

      try {
        await starboardChannel.send({
          embeds: [await this.setEmbedImage(embed)],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setLabel('Jump to message').setStyle(ButtonStyle.Link).setURL(reaction.message.url),
            ),
          ],
        });
      } catch (error) {
        logger.error(`Error while setting/sending embed: ${error.stack}`);
      }
    } else {
      const embed = EmbedBuilder.from(starredMessage.embeds[0]);

      embed.setDescription(`${reactionString.join(' • ')}`);

      try {
        await starredMessage.edit({ embeds: [embed] });
      } catch (error) {
        logger.error(`Failed to edit starboard message: ${error.stack}`);
      }
    }
  }
}

export default Starboard;
