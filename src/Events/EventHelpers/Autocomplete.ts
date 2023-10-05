import { AutocompleteInteraction } from 'discord.js';
import { client } from '../..';
import { formatSeconds } from '../../functions/formatSeconds';

const Autocomplete = async (interaction: AutocompleteInteraction) => {
  const query = interaction.options.getString('song', true);

  if (!query.length) return;

  const results = await client.poru.resolve({ query: query, source: 'ytsearch' });
  const tracks = results.tracks.slice(0, 10).map((t) => ({
    name: `${`${t.info.title} - ${t.info.author} - (${formatSeconds(t.info.length / 1000)}) `.slice(0, 95)}...`,
    value: t.info.uri,
  }));

  return interaction.respond(tracks);
};

export default Autocomplete;
