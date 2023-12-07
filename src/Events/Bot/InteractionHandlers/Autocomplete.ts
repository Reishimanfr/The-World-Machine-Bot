import { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from "discord.js";
import { client } from "../../..";
import { playlists } from "../../../Data/DatabaseSchema";
import { clipString } from "../../../Funcs/ClipString";
import { fetchMember } from "../../../Funcs/FetchMember";
import { formatSeconds } from "../../../Funcs/FormatSeconds";
import { log } from "../../../Helpers/Logger";

type tracksType = {
  name: string,
  value: string,
  length?: number,
}

const Autocomplete = async (interaction: AutocompleteInteraction) => {
  const subcommand = interaction.options.getSubcommand(false)

  log.debug(subcommand)

  if (subcommand && interaction.commandName === 'playlist') {
    switch (subcommand) {
      case 'remove':
      case 'load': {
        const tracks = await playlists.findAll({ where: { userId: interaction.user.id } })
        const names = tracks.map(t => t.getDataValue('name'))

        if (names.length <= 0) {
          return interaction.respond([
            {
              name: '❌ You don\'t have any playlists saved!',
              value: 'autocomplete_no_user_input'
            }
          ])
        }

        let response: { name: string, value: string }[] = []

        for (let i = 0; i < 25; i++) {
          if (!names[i]) break;

          response.push({
            name: names[i],
            value: names[i]
          })
        }

        interaction.respond(response)
        break;
      }
    }
  }

  switch (interaction.commandName) {
    case 'play': {
      const query = interaction.options.getString("url-or-search", true);

      if (!query.length) return interaction.respond([
        {
          name: '🔎 Start typing to show search options for spotify and youtube.',
          value: 'autocomplete_no_user_input'
        }
      ])

      if (query.length >= 100) {
        return interaction.respond([
          {
            name: '❌ This link is too large!',
            value: 'autocomplete_no_user_input'
          }
        ])
      }

      if (query.startsWith('https://')) {
        return interaction.respond([
          {
            name: `🔗 ${clipString({ string: query, maxLength: 90, sliceEnd: '...' })}`,
            value: query
          }
        ])
      }

      const tracks: tracksType[] = [];

      const resolveAndPush = async (source: string, prefix: string) => {
        const resolve = await client.poru.resolve({ query: query, source: source });
        const resolveTracks = resolve.tracks.slice(0, 5);

        for (let i = 0; i < resolveTracks.length; i++) {
          const track = resolveTracks[i];
          let trackString = `${prefix}: `;

          trackString += `${track.info.title} - ${track.info.author}`;

          if (trackString.length > 99) {
            trackString = trackString.slice(0, 80) + '...'
          }

          trackString += ` - (${formatSeconds(track.info.length / 1000)})`;

          tracks.push({ name: trackString.slice(0, 99), value: track.info.uri });
        }
      };

      await Promise.all([
        resolveAndPush("ytsearch", "🟥 Youtube"),
        resolveAndPush("spsearch", "🟩 Spotify"),
      ]);

      return interaction.respond(tracks);
    }

    case 'skipto': {
      const player = client.poru.players.get(interaction.guild!.id)
      const queue = player?.queue

      const member = await fetchMember(interaction.guild!.id, interaction.user.id)

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
};

export default Autocomplete;
