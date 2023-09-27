import commandList from '../../bot_data/commandList';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtPlayer } from '../../misc/twmClient';
import { client } from '../..';
import { logger } from '../../misc/logger';
import util from '../../misc/Util';

const Command = async (interaction: CommandInteraction) => {
  const command = commandList.find((c) => c.data.name == interaction.commandName);

  if (!command) {
    return interaction.reply({
      embeds: [
        {
          description:
            '[ Something went fatally wrong: the command file seems to be missing. ]',
          color: 9109708,
        },
      ],
    });
  }

  // Missing permissions check
  if (command.permissions) {
    const currentPerms = interaction.guild?.members.me?.permissions;
    const missingPermissions = command.permissions.filter(
      (perm) => !currentPerms?.has(perm)
    );

    if (missingPermissions.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              '[ Command requires missing bot permissions. ]\n' +
                missingPermissions.join(', ')
            )
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }
  }

  // Music commands check
  if (command.musicCommand) {
    if (!interaction.inCachedGuild()) return;

    if (!interaction.member.voice.channel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in a voice channel to use this. ]')
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }

    const poruPlayer = client.poru.get(interaction.guildId) as ExtPlayer;

    if (
      poruPlayer?.connection &&
      interaction.member.voice.channelId !==
        interaction.guild.members.me?.voice.channelId
    ) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('[ You must be in the same voice channel to use this. ]')
            .setColor(util.twmPurpleHex),
        ],
        ephemeral: true,
      });
    }
  }

  try {
    await command.callback(interaction, client);
  } catch (error) {
    logger.error(`Command ${interaction.commandName} failed: ${error.stack}`);
  }
};

export default Command;
