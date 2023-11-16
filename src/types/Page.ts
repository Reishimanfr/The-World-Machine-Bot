import { ActionRowBuilder, ButtonBuilder, CommandInteraction, EmbedBuilder, StringSelectMenuBuilder } from "discord.js"
import { ExtClient } from "../Helpers/ExtendedClasses"

type Page = {
  pageIndex: number
  components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]
  callback: (interaction: CommandInteraction, client: ExtClient) => any
}

export default Page