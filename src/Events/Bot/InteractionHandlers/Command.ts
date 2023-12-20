import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { client } from '../../..';
import commandList from '../../../Data/CommandExport';
import { fetchMember } from '../../../Funcs/FetchMember';
import { ExtPlayer } from '../../../Helpers/ExtendedClasses';
import { MessageManager } from '../../../Helpers/MessageManager';
import { PlayerController } from '../../../Helpers/PlayerController';
import { QueueManager } from '../../../Helpers/QueueManager';
import { embedColor } from '../../../Helpers/Util';
import { combineConfig } from '../../../Helpers/config/playerSettings';
import { botStats } from '../../../Models';

const Command = async (interaction: ChatInputCommandInteraction) => {
  const command = commandList.find(c => c?.data?.name == interaction.commandName)
  const guild = interaction.guild

  // Typeguard
  if (!guild) return

  if (!command) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("[ This command doesn't exist. ]")
          .setColor(embedColor),
      ],
      ephemeral: true,
    });
  }

  // Missing permissions check
  // TODO: FIX THIS
  // if (command.permissions) {
  //   const currentPerms = interaction.guild?.members.me?.permissions;
  //   const missingPermissions = command.permissions.filter((perm) => !currentPerms?.has(perm));

  //   if (missingPermissions.length) {
  //     return interaction.reply({
  //       content: "I'm missing permissions required for this command. Please try again after giving me these permissions:\n" + missingPermissions.join(', '),
  //       ephemeral: true
  //     })
  //   }
  // }

  let player = client.poru.players.get(guild.id) as ExtPlayer

  // Case for music commands
  if (command.musicOptions) {
    const options = command.musicOptions

    const config = await combineConfig(guild.id)
    const member = await fetchMember(guild.id, interaction.user.id)

    // Member is not in voice channel
    if (options.requiresVc && !member?.voice.channel?.id) {
      return interaction.reply({
        content: 'You must be in a voice channel to use this command.',
        ephemeral: true
      })
    }

    // Member is not in the same voice channel as bot
    if (options.requiresVc && player && member?.voice.channel?.id !== player?.voiceChannel) {
      return interaction.reply({
        content: 'You must be in the same voice channel as me to use this command.',
        ephemeral: true
      })
    }

    // Member doesn't have the DJ role
    if (options.requiresDjRole && config.requireDjRole && !member?.roles.cache.find(role => role.id === config.djRoleId)) {
      return interaction.reply({
        content: `You must have the <@&${config.djRoleId}> role to use this command.`,
        ephemeral: true
      })
    }

    if (!player) {
      player = client.poru.createConnection({
        guildId: guild.id,
        voiceChannel: member!.voice.channel!.id,
        textChannel: interaction.channel!.id,
        deaf: true,
        mute: false,
      }) as ExtPlayer;
    }
  }

  const args = {
    interaction,
    client,
    player,
    controller: new PlayerController(player),
    message: new MessageManager(player),
    queue: new QueueManager(player)
  }

  try {
    await command.callback(args);
  } finally {
    const [record] = await botStats.findOrCreate(
      {
        where: { guildId: guild.id },
        defaults: {
          guildId: guild.id,
          commandsRan: 0
        }
      }
    )

    await record?.increment('commandsRan', { by: 1 })
  }
};

export default Command;