import { Events } from 'discord.js'
import { logger } from '../../Helpers/Logger'
import type { Event } from '../../Types/Event'
import pjson from '../../../package.json'
import axios from 'axios'
import semver from 'semver'
import type { Bot } from '../../Classes/Bot'

async function checkIfNewVersionAvailable() {
  const REPOSITORY_URL = 'https://api.github.com/repos/Reishimanfr/The-World-Machine-Bot/tags'

  try {
    const response = await axios.get(REPOSITORY_URL)

    const latestTag = response.data[0].name
    const currentVer = pjson.version

    if (semver.gt(latestTag, currentVer)) {
      logger.warn(`TWM v${latestTag} is available (currently running ${pjson.version})`)
    }
  } catch (error) {
    logger.error(`Failed to perform version checking: ${error.stack}`)
  }
}

const Ready: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Bot) => {
    await checkIfNewVersionAvailable()

    client.poru.init(client)
    logger.info(`${client.user.username} is online.`)
  }
}

export default Ready
