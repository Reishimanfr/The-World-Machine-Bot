import { Events, type Interaction, InteractionType } from 'discord.js'
import type Event from '../../types/Event'
import Autocomplete from './InteractionHandlers/Autocomplete'
import Button from './InteractionHandlers/Button'
import CommandInteraction from './InteractionHandlers/Command'
import { logger } from '../../config'

const InteractionMap = {
  [InteractionType.ApplicationCommandAutocomplete]: Autocomplete,
  [InteractionType.ApplicationCommand]: CommandInteraction,
  [InteractionType.MessageComponent]: Button
}

const InteractionNames = {
  [InteractionType.ApplicationCommand]: "ApplicationCommand",
  [InteractionType.ApplicationCommandAutocomplete]: "ApplicationCommandAutocomplete",
  [InteractionType.MessageComponent]: "MessageComponent",
  [InteractionType.ModalSubmit]: "ModalSubmit",
  [InteractionType.Ping]: "Ping"
}

const InteractionCreate: Event = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: Interaction) => {
    logger.debug(`Recieved interaction type [${InteractionNames[interaction.type]}`)

    const handler = InteractionMap[interaction.type]

    if (!handler) {
      logger.warn(`Unhandled interaction [${InteractionNames[interaction.type]}] `)
      return
    }

    try {
      logger.debug(`Handler function exists. Trying to handle interaction [${InteractionNames[interaction.type]}]`)
      await handler(interaction)
    } catch (error) {
      logger.error(`Encountered a error while running interaction [${InteractionNames[interaction.type]}]: ${error.stack}`)
    }
  }
}

export default InteractionCreate
