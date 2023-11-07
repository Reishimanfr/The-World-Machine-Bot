import { AutocompleteInteraction } from "discord.js";
import { client } from "../../..";
import { formatSeconds } from "../../../functions/formatSeconds";

type tracksType = {
  name: string,
  value: string,
  len?: number,
}

const Autocomplete = async (interaction: AutocompleteInteraction) => {
  const query = interaction.options.getString("url-or-search", true);

  if (!query.length) return;

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
    resolveAndPush("ytsearch", "Youtube"),
    resolveAndPush("spsearch", "Spotify"),
  ]);

  return interaction.respond(tracks);
};

export default Autocomplete;
