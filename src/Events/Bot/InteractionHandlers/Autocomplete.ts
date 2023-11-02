import { AutocompleteInteraction } from "discord.js";
import { client } from "../../..";
import { formatSeconds } from "../../../functions/formatSeconds";

const Autocomplete = async (interaction: AutocompleteInteraction) => {
  const query = interaction.options.getString("url-or-search", true);

  if (!query.length) return;

  const tracks: { name: string; value: string }[] = [];

  const resolveAndPush = async (source: string, prefix: string) => {
    const resolve = await client.poru.resolve({ query: query, source: source });
    const resolveTracks = resolve.tracks.slice(0, 3);

    resolveTracks.map((track) => {
      let trackString = `${prefix}: `;

      trackString += `${track.info.title} - ${track.info.author}`.slice(0, 85);
      trackString += ` - (${formatSeconds(track.info.length / 1000)})`;

      tracks.push({ name: trackString.slice(0, 99), value: track.info.uri });
    });
  };

  await Promise.all([
    resolveAndPush("ytsearch", "Youtube"),
    resolveAndPush("spsearch", "Spotify"),
    resolveAndPush("scsearch", "Soundcloud"),
  ]);

  return interaction.respond(tracks);
};

export default Autocomplete;
