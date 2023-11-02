import { ButtonInteraction } from "discord.js";
import { ExtPlayer } from "../../../../Helpers/ExtendedClient";
import { skipvote } from "../../../../commands/music/control/skip";

export const skip = async (
  interaction: ButtonInteraction,
  player: ExtPlayer
) => {
  await skipvote(interaction, player);
};
