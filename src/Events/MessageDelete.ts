import { Message, PartialMessage } from 'discord.js';
import { logger } from '../misc/logger';
import { starboardEntries } from '../types/database_definition';

const MessageDelete = async (message: Message | PartialMessage) => {
  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      logger.error(`Error fetching partial deleted message: ${error.stack}`);
    }
  }

  const entry = await starboardEntries.findOne({
    where: { messageId: message.id, guildId: message.guildId },
  });

  const data = entry?.dataValues;

  if (!data) return;

  await entry.update({
    blackListed: true,
  });
};

export default MessageDelete;
