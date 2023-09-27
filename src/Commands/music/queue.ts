// import {
//   ActionRowBuilder,
//   ButtonBuilder,
//   ButtonStyle,
//   EmbedBuilder,
//   SlashCommandBuilder,
// } from 'discord.js';
// import Command from '../../types/command_type';
// import { ExtPlayer } from '../../misc/twmClient';
// import QueueManager from '../../bot_data/queueManager';

// const queue: Command = {
//   devOnly: false,
//   permissions: [],
//   musicCommand: true,

//   // Go fuck yourself I will kill you
//   data: new SlashCommandBuilder()
//     .setName('queue')
//     .setDescription('See and edit the current queue'),

//   callback: async (interaction, client) => {
//     const player = client.poru.players.get(interaction.guildId) as ExtPlayer;
//     const queueManager = new QueueManager(player);

//     if (!player.queue.length) {
//       interaction.reply({
//         embeds: [
//           new EmbedBuilder()
//             .setDescription('[ There is nothing in the queue. ]')
//             .setColor(util.twmPurpleHex),
//         ],
//         ephemeral: true,
//       });
//       return;
//     }

//     const embed = queueManager.showQueue();

//     const helpButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
//       new ButtonBuilder()
//         .setCustomId('songcontrol-queuehelp')
//         .setEmoji('❔')
//         .setStyle(ButtonStyle.Secondary)
//     );

//     interaction.reply({
//       embeds: [embed],
//       components: [helpButton],
//       ephemeral: true,
//     });
//   },
// };

// export default queue;
