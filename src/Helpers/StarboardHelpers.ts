import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  EmbedField,
  GuildBasedChannel,
  GuildEmoji,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  ReactionEmoji,
  User,
} from "discord.js";
import {
  starboardBlacklistedChannels,
  starboardConfig,
  starboardEmojis,
  starboardEntries,
} from "./DatabaseSchema";
import { logger } from "./Logger";
import util from "./Util";

type UserOrPart = User | PartialUser;
type ReactionOrPart = MessageReaction | PartialMessageReaction;

const AcceptedImages = ["image/gif", "image/jpeg", "image/png", "image/webp"];
const AcceptedLinkHeaders = [
  "https://cdn.discordapp.com/attachments",
  "https://media.discordapp.net/attachments",
];

class Starboard {
  private user: UserOrPart;
  private reaction: ReactionOrPart;

  constructor(reaction: ReactionOrPart, user: UserOrPart) {
    this.reaction = reaction;
    this.user = user;
  }

  /**
   * Formats the reaction emoji into a escaped sequence
   */
  private formatReactionString(
    reactionEmoji: ReactionEmoji | GuildEmoji
  ): string {
    return (
      (reactionEmoji.id
        ? `<${reactionEmoji.animated ? "a" : ""}:${reactionEmoji.name}:${reactionEmoji.id
        }>`
        : this.reaction.emoji.name) ?? "Error!"
    );
  }

  private async setImage(reaction: MessageReaction): Promise<string | null> {
    const content = reaction.message.content?.trim();
    const attachment = reaction.message.attachments?.at(0);

    if (attachment && AcceptedImages.includes(attachment.contentType!)) {
      return attachment.url;
    }

    if (!content?.length) return null;

    const splitContent = content?.split(" ");
    let links: string[] = [];

    splitContent?.forEach((part) => {
      AcceptedLinkHeaders.forEach((header) => {
        if (part.startsWith(header)) links.push(part);
      });
    });

    if (!links.length) return null;

    for (const link of links) {
      const isImage = await this.checkIfValidImage(link);

      if (isImage) {
        return link;
      }
    }

    return null;
  }

  /**
   * Checks if a link has a content-type header that's a accepted image MIME
   */
  private async checkIfValidImage(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url);

      if (response.status >= 200 && response.status < 300) {
        const contentType = response.headers["content-type"];
        if (contentType && AcceptedImages.includes(contentType)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error(`Error checking URL ${url}: ${error}`);
      return false;
    }
  }

  private async getServerConfig(serverId: string): Promise<any> {
    const [guildEmojis, guildConfig, channelBlacklist] = await Promise.all([
      // server emojis
      starboardEmojis
        .findAll({ where: { guildId: serverId } })
        .then((part) => part.map((emoji) => emoji.getDataValue("emoji"))),

      // server config
      starboardConfig
        .findOne({ where: { guildId: serverId } })
        .then((part) => part?.dataValues),

      // Blacklisted server channels
      starboardBlacklistedChannels
        .findAll({ where: { guildId: serverId } })
        .then((part) => part.map((ch) => ch.getDataValue("channelId"))),
    ]);

    return [guildEmojis, guildConfig, channelBlacklist];
  }

  private async setFields(): Promise<EmbedField[]> {
    const message = this.reaction.message;

    const fields: EmbedField[] = [];

    if (
      message.content ||
      message.embeds[0]?.data?.description ||
      message.attachments.size
    ) {
      const embed = message.embeds[0] ?? null;
      let contentString = `<@${message.author?.id}>: `;

      const hasValidHeader: boolean[] = [];

      AcceptedLinkHeaders.forEach((header) =>
        hasValidHeader.push(message.content?.startsWith(header) ?? false)
      );

      const messageIsLinkOnly =
        message.content &&
        message.content?.split(" ").length == 1 &&
        hasValidHeader.some((value) => value);

      if (messageIsLinkOnly) {
        const split = message.content?.split("?")[0].split("/")!;

        fields.push({
          name: "📄 Message:",
          value: `[${split.pop()}](${message.content})`,
          inline: false,
        });
        return fields;
      }

      if (message.content) {
        contentString += message.content;
      } else if (embed && embed.data.description) {
        contentString += embed.data.description;
      } else if (message.attachments.size) {
        contentString = `=Message contains attachments (${message.attachments.size})=`;
      } else {
        contentString = "⚠️ Failed to fetch message content TwT";
      }

      fields.push({
        name: "📄 Message:",
        value:
          contentString.length > 500
            ? contentString.slice(0, 500) + "..."
            : contentString,
        inline: false,
      });
    }

    if (message.reference) {
      const reference = await message.fetchReference();
      const refEmbed = reference.embeds[0] ?? null;
      let referenceString = `<@${reference.author.id}>:`;

      if (reference.content) {
        referenceString += ` ${reference.content}`;
      } else if (refEmbed && refEmbed.data.description) {
        referenceString += refEmbed.data.description;
      } else if (reference.attachments.size) {
        referenceString = ` =Message contains attachments (${reference.attachments.size})=`;
      } else {
        referenceString = "⚠️ Failed to fetch message reference TwT";
      }

      fields.push({
        name: "↩️ Replying to:",
        value:
          (referenceString.length > 500
            ? referenceString.slice(0, 500) + "..."
            : referenceString) + "\n​",
        inline: false,
      });
    }

    return fields;
  }

  public async main() {
    // Fetch the reaction if it's partial
    const reaction = this.reaction.partial
      ? await this.reaction.fetch()
      : this.reaction;

    const [emoji, config, blacklist] = await this.getServerConfig(
      reaction.message.guildId!
    );

    if (!config || !config?.boardId) return; // There is no config or configured channel
    if (blacklist.includes(reaction.message.channelId)) return; // The channel is blacklisted
    if (reaction.message.channelId == config.boardId) return; // The reaction channel is the same as starboard channel
    if (reaction.message.author!.id == this.user.id) return; // If the user reacting is the same as the message's author

    const reactionEmoji = this.formatReactionString(reaction.emoji);

    if (!emoji.includes(reactionEmoji)) return; // The emoji isn't accepted for the starboard

    const reactions: { emoji: string; count: number }[] = [];

    reaction.message.reactions.cache.forEach((rect) => {
      let emojiName = rect.emoji.name;

      if (rect.emoji.id) {
        emojiName = `<${rect.emoji.animated ? "a" : ""}:${rect.emoji.name}:${rect.emoji.id
          }>`;
      }

      if (emojiName && emoji.includes(emojiName)) {
        reactions.push({ emoji: emojiName, count: rect.count });
      }
    });

    reactions.sort((a, b) => b.count - a.count);

    // None of the reactions are equal or more than config amount
    if (!reactions.some((rect) => rect.count >= config.amount)) return;

    const boardChannel:
      | GuildBasedChannel
      | null
      | void
      = await reaction.message.guild?.channels.fetch(config.boardId).catch(() => { }) ?? null

    // Return if channel is not a TextChannel or it doesn't exist
    if (!boardChannel || boardChannel.type != ChannelType.GuildText) return

    const message = await starboardEntries.findOne({
      where: { starredMessageUrl: reaction.message.url },
    });

    const reactionStrings: string[] = reactions.map(
      (rect) => `${rect.emoji}: ${rect.count}`
    );

    if (!message) {
      const [member, count, fields, embedImage] = await Promise.all([
        await util.fetchMember(
          reaction.message.guildId!,
          reaction.message.author!.id
        ),
        await starboardEntries.count({
          where: { guildId: reaction.message.guildId },
        }),
        await this.setFields(),
        await this.setImage(reaction),
      ]);

      const lastMsg = await boardChannel.messages.fetch({ limit: 1 })
      const lastEmbed = EmbedBuilder.from(lastMsg.at(0)!.embeds[0])

      if (lastEmbed.data.author!.name === `Entry #${count}`) return

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `Entry #${count == 0 ? 1 : count}`,
          iconURL: reaction.message.guild?.iconURL()!,
        })
        .setColor(member.roles.highest.color)
        .setThumbnail(member.displayAvatarURL({ extension: "png" }))
        .setDescription(reactionStrings.join(" • "))
        .addFields(fields)
        .setImage(embedImage)
        .setTimestamp();

      const refButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Jump to message")
          .setStyle(ButtonStyle.Link)
          .setURL(reaction.message.url)
      );

      try {
        const res = await boardChannel.send({
          embeds: [embed],
          components: [refButton],
        });

        await starboardEntries.create({
          guildId: reaction.message.guildId,
          botMessageUrl: res.url,
          starredMessageUrl: reaction.message.url,
        });
      } catch (error) {
        logger.error(`Failed to send starboard message: ${error.stack}`);
      }
    } else if (message) {
      const requestId: string = await message.getDataValue("botMessageUrl");
      const messageId = requestId.split("/").pop();

      if (!messageId) {
        logger.error(
          `Failed to update starboard embed due to a missing messageId`
        );
        return;
      }

      const fetchMsg = await boardChannel.messages
        .fetch(messageId)
        .catch(() => { });

      if (!fetchMsg) return;

      const embed = EmbedBuilder.from(fetchMsg.embeds[0]).setDescription(
        reactionStrings.join(" • ")
      );

      try {
        fetchMsg.edit({
          embeds: [embed],
        });
      } catch (error) {
        logger.error(`Failed to update starboard message: ${error.stack}`);
      }
    }
  }
}

export default Starboard;
