import { AutocompleteInteraction } from "discord.js";
import commandList from "../../../Data/CommandExport";
import { logger } from "../../../Helpers/Logger";

const Autocomplete = async (interaction: AutocompleteInteraction) => {
  const command = commandList.find(c => c.data.name === interaction.commandName)

  if (command?.autocomplete) {
    try {
      command.autocomplete(interaction)
    } catch (error) {
      logger.error(`Autocomplete interaction for command "${interaction.commandName}" failed: ${error}`)
    }
  }
};

export default Autocomplete;
