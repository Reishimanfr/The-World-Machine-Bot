import { ApplicationCommandOptionChoiceData, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Queue from "poru/dist/src/guild/Queue";
import { client } from "../..";
import { fetchMember } from "../../Funcs/FetchMember";
import { embedColor } from "../../Helpers/Util";
import { config as botConfig } from "../../config";
import Command from "../../types/Command";

const skipTo: Command<true> = {
  permissions: {
    user: ['Speak', 'Connect', 'SendMessages'],
    bot: ['Speak', 'Connect', 'SendMessages']
  },

  musicOptions: {
    requiresDjRole: true,
    requiresPlaying: true,
    requiresVc: true
  },

  data: new SlashCommandBuilder()
    .setName("skipto")
    .setDescription("Skip to a specified song in the queue")
    .addNumberOption(pos => pos
      .setName("position")
      .setDescription("Position in the queue to skip to")
      .setRequired(true)
      .setAutocomplete(botConfig.hostPlayerOptions.autocomplete)
      .setMinValue(1)
    ),

  callback: async ({ interaction, player }) => {
    const position = interaction.options.getNumber("position", true);

    // This means autocomplete was used with a invalid value since pos can't be less than 1
    // If it's sent as a command (thanks discord!)
    if (position == -1) return;

    if (player.queue.length < position) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`[ There isn't a song in the position you specified. ]`)
            .setColor(embedColor),
        ], ephemeral: true,
      });
    }

    player.queue = player.queue.slice(position - 1, player.queue.length) as Queue;
    player.seekTo(player.currentTrack.info.length);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`[ Skipped to song **${player.queue.at(0).info.title}**. ]`)
          .setColor(embedColor),
      ], ephemeral: true
    });
  },

  autocomplete: async (interaction) => {
    if (!interaction.guild) return

    const player = client.poru.players.get(interaction.guild.id)
    const queue = player?.queue

    const member = await fetchMember(interaction.guild.id, interaction.user.id)

    if (!member) return

    if (!member.voice.channel?.id) {
      return interaction.respond([
        {
          name: '❌ You must be in a voice channel to use this.',
          value: -1
        }
      ])
    }

    if (member.voice.channel.id !== player?.voiceChannel) {
      return interaction.respond([
        {
          name: '❌ You must be in the same voice channel to use this.',
          value: -1
        }
      ])
    }

    if (!queue?.length) {
      return interaction.respond([
        {
          name: '❌ There are no songs in the queue to skip to.',
          value: -1
        }
      ])
    }

    let response: ApplicationCommandOptionChoiceData[] = []

    for (let i = 0; i < queue.length; i++) {
      if (i >= 25) break; // Discord limits autocomplete to 25 options
      const part = queue[i]

      response.push({
        name: `${part.info.title} - ${part.info.author}`,
        value: i + 1
      })
    }

    return interaction.respond(response)
  }
}

export default skipTo