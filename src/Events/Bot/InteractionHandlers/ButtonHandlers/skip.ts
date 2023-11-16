import { ButtonInteraction } from "discord.js";
import { ExtPlayer } from "../../../../Helpers/ExtendedClasses";
import { skipvote } from "../../../../commands/music/main/skip";

export const skip = async (
  interaction: ButtonInteraction,
  player: ExtPlayer
) => {
  await skipvote(interaction, player);
};
