import { Colors, EmbedBuilder, Interaction, Message } from 'discord.js';
import { logger } from './logger';

export const handleError = (error: Error, interaction?: Interaction, message?: Message): void => {

    if (interaction) {
        const embed = new EmbedBuilder()
            .setDescription(`A error occurred while trying to process this ${interaction.isCommand() ? 'command' : 'component'}!\`\`\`${error.message}\`\`\``)
            .setColor(Colors.Red)
            .setTimestamp();

        const replied = interaction?.isRepliable() && interaction?.replied;

        if (replied) {
            interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            interaction.channel.send({ embeds: [embed] });
        }
    }

    if (message) {
        const embed = new EmbedBuilder()
            .setDescription(`A error occurred while trying to process this message!\`\`\`${error.message}\`\`\``)
            .setColor(Colors.Red)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }

    logger.error(error.stack);
};