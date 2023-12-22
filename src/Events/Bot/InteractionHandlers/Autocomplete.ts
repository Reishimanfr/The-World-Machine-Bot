import { AutocompleteInteraction } from "discord.js";
import commandList from "../../../Data/CommandExport";
import { log } from "../../../Helpers/Logger";

const Autocomplete = async (interaction: AutocompleteInteraction) => {
  const command = commandList.find(c => c.data.name === interaction.commandName)

  if (command?.autocomplete) {
    try {
      command.autocomplete(interaction)
    } catch (error) {
      log.error(`Autocomplete interaction for command "${interaction.commandName}" failed: ${error}`)
    }
  }
};

export default Autocomplete;
