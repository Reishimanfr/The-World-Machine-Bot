import { AutocompleteInteraction } from 'discord.js';
import { client } from '../../..';
import { formatSeconds } from '../../../functions/formatSeconds';

const Autocomplete = async (interaction: AutocompleteInteraction) => {
  const query = interaction.options.getString('url-or-search', true);

  if (!query.length) return;

  const tracks: { name: string; value: string }[] = [];

  const ytRequest = await client.poru.resolve({ query: query, source: 'ytsearch' });
  const spRequest = await client.poru.resolve({ query: query, source: 'spsearch' });
  const scRequest = await client.poru.resolve({ query: query, source: 'scsearch' });

  ytRequest.tracks.slice(0, 3).map((res) => {
    let resultString = 'Youtube: ';

    resultString += `${res.info.title} - ${res.info.author}`.slice(0, 85);
    resultString += ` - (${formatSeconds(Math.trunc(res.info.length / 1000))})`;

    tracks.push({ name: resultString, value: res.info.uri });
  });

  spRequest.tracks.slice(0, 3).map((res) => {
    let resultString = 'Spotify: ';

    resultString += `${res.info.title} - ${res.info.author}`.slice(0, 85);
    resultString += ` - (${formatSeconds(Math.trunc(res.info.length / 1000))})`;

    tracks.push({ name: resultString, value: res.info.uri });
  });

  scRequest.tracks.slice(0, 3).map((res) => {
    let resultString = 'Soundcloud: ';

    resultString += `${res.info.title} - ${res.info.author}`.slice(0, 85);
    resultString += ` - (${formatSeconds(Math.trunc(res.info.length / 1000))})`;

    tracks.push({ name: resultString, value: res.info.uri });
  });

  return interaction.respond(tracks);
};

export default Autocomplete;
