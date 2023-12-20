import { EmbedBuilder } from "discord.js";
import { embedColor } from "../../Helpers/Util";

export const starboardHelpPages = [
  new EmbedBuilder()
    .setDescription(`### General info
A 🌟 starboard is a channel where users can highlight and showcase interesting or funny messages from other channels by "starring" them with a specified emoji (or emojis!).
The starboard collects and displays these highlighted messages in one location for the community to enjoy. Think of it as 📌 community pins! `)
    .setColor(embedColor)
    .setImage('https://cdn.discordapp.com/attachments/1169390259411369994/1178773412454334525/image.png'),

  new EmbedBuilder()
    .setDescription(`### Usage
To use the starboard feature simply **add one of the accepted reaction emojis** to a message you'd like to see in the starboard channel.
The message **will be added to the starboard once it reaches the required amount of a reaction emoji**.`)
    .setImage('https://cdn.discordapp.com/attachments/1169390259411369994/1178795579787182220/Discord_eOi5wLpF4l.gif')
    .setColor(embedColor),

  new EmbedBuilder()
]
