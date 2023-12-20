import { Events, Message } from "discord.js"
import Markov from "markov-strings"
import { client } from "../.."
import { log } from "../../Helpers/Logger"
import { chainData, chainSettings } from "../../Models"
import Event from "../../types/Event"

const MAX_TRIES = 1000
const MAX_STRING_LENGTH = 50
const STATE_SIZE = 2

interface ChainSettings {
  channels: string[]
  captureChance: number
  sendChance: number
  ignoredUsers: string[]
}


function generateMessage(data: string[]): string | null {
  const chain = new Markov({ stateSize: STATE_SIZE })
  chain.addData(data)

  try {
    const generateMessage = chain.generate({
      maxTries: MAX_TRIES,
      filter: (res) => {
        return res.string.length <= MAX_STRING_LENGTH
      }
    })

    return generateMessage.string
  } catch (error) {
    log.error(`Failed to generate markov chain message: ${error}`)
    return null
  }
}

const MessageCreate: Event = {
  name: Events.MessageCreate,
  once: false,

  execute: async (msg: Message) => {
    if (
      msg.author.bot ||
      msg.content.trim().length < 1 ||
      !client.user?.id
    ) return

    const [record] = await chainSettings.findOrCreate({
      where: { guildId: msg.guildId },
    })

    const config: ChainSettings = record.dataValues

    if (!config.channels || config.sendChance < 0) return

    // Save a message randomly
    if (Math.random() < config.captureChance) {
      const [record] = await chainData.findOrCreate({
        where: { guildId: msg.guildId },
        defaults: { guildId: msg.guildId, chainData: [] }
      })

      const currentData: string[] = record.getDataValue('chainData')

      // Append the new message
      await record.update({
        chainData: currentData.concat(msg.content)
      }, {
        where: { guildId: msg.guildId }
      })
    }

    if (Math.random() < config.sendChance || msg.mentions.has(client.user.id)) {
      // Default in case this fires between a single message is collected
      const [record] = await chainData.findOrCreate({
        where: { guildId: msg.guildId },
        defaults: { guildId: msg.guildId, chainData: [] }
      })

      const data: string[] = record.getDataValue('chainData')

      // No data is present
      if (data.length < 1) return;

      const message = generateMessage(data)

      if (message) {
        return msg.channel.send({
          content: message
        })
      }

      // Reply if mention trigger
      if (!message && msg.mentions.has(client.user.id)) {
        await msg.channel.send({
          content: '⚠️ Failed to generate a message.'
        })
      }
    }
  }
}

export default MessageCreate