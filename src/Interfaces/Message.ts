import { Message } from 'discord.js';
import { EmojiHandler } from '../Misc/EmojiHandler';

async function handle_emoji(message: Message) {
    const emoji_handler = new EmojiHandler(message);
    const has_emoji = message.content.split(' ').some(emoji_handler.emoji_validator);

    if (!has_emoji) return;

    await emoji_handler.initiate_emoji();
}

export const onMessage = async (message: Message) => {
    handle_emoji(message);
};

//* I may finish this someday
// export const onMessageEdit = async (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) => {
//     if (newMessage.partial || oldMessage.partial) {
//         try {
//             await oldMessage.fetch();
//             await newMessage.fetch();
//         } catch (error) {
//             logger.error(error.stack);
//             return;
//         }
//     }

//     const button_row = new ActionRowBuilder<ButtonBuilder>()
//         .addComponents(
//             new ButtonBuilder()
//                 .setCustomId('yes')
//                 .setLabel('Yes')
//                 .setStyle(ButtonStyle.Success),

//             new ButtonBuilder()
//                 .setCustomId('no')
//                 .setLabel('No')
//                 .setStyle(ButtonStyle.Danger)
//         );

//     const reply = await oldMessage.reply({ content: `${oldMessage.author}, do you want me to update this message, so that the emoji shows up?`, components: [button_row] })
//     const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

//     collector.on('collect', c => {
//         if (c.customId === 'yes') {
//             handle_emoji(newMessage as Message);
//         } else {

//         }
//     });

//     handle_emoji(newMessage as Message);
// };