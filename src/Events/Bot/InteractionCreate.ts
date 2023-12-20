import { Events, Interaction, InteractionType } from "discord.js";
import Event from "../../types/Event";
import Autocomplete from "./InteractionHandlers/Autocomplete";
import Button from "./InteractionHandlers/Button";
import Command from "./InteractionHandlers/Command";

const InteractionMap = {
  [InteractionType.ApplicationCommandAutocomplete]: Autocomplete,
  [InteractionType.ApplicationCommand]: Command,
  [InteractionType.MessageComponent]: Button,
};

const InteractionCreate: Event = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: Interaction) => {
    const handler = InteractionMap[interaction.type];
    await handler(interaction);
  },
};

export default InteractionCreate;
