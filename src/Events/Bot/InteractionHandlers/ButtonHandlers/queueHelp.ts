import {
  AnySelectMenuInteraction,
  ButtonInteraction,
  EmbedBuilder,
} from 'discord.js';

export const queueHelp = (
  interaction: AnySelectMenuInteraction | ButtonInteraction
) => {
  const embeds: EmbedBuilder[] = [
    new EmbedBuilder().setDescription(`### Viewing the queue
You can view the queue either with the \`/queue\` command or with the <:show_queue:1136985358920331274> button.`),

    new EmbedBuilder().setDescription(`### Removing songs
To do this, use the \`/remove\` command. Depending on how you write the array of songs to remove, you can do different things.
* You can input a number to delete a song at a specific position in the queue
  * Example: \`/remove 2\` <- This would remove the song at position \`2\`
* You can also type in multiple songs positions at once, separated by \`,\`'s
  * Example: \`/remove 2, 4, 5\` <- This would remove songs at positions \`2\`, \`4\` and \`5\`
* You can also input a range of songs to remove
  * Example: \`/remove 2-5\` <- This would remove all songs from position \`2\` to \`5\``),

    new EmbedBuilder().setDescription(`### Replacing songs
To replace a song in the queue, use the \`/replace\` command (what a shocker).
This one's a bit simpler, all you have to do is:
* Input the song's search query or link as the 1st parameter
* Input the queue position you want to replace as the 2nd one
  * Example: \`/replace (My burden is light) (3)\` <- This will replace the 3rd song in the queue with "My burden is light"

*Psst... If the original player embed was lost, you can always use the \`/now-playing\` command to bring it back!*`),
  ];

  interaction.editReply({
    embeds: [...embeds],
  });
};
