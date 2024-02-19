import { ActivityType, Events } from 'discord.js'
import { type ExtClient } from '../../Helpers/ExtendedClasses'
import { logger } from '../../config'
import type Event from '../../types/Event'
import pjson from "../../../package.json"
import axios from 'axios'
import semver from 'semver'

async function checkIfNewVersionAvailable() {
  const REPOSITORY_URL = "https://api.github.com/repos/Reishimanfr/The-World-Machine-Bot/tags"

  logger.info('Checking for any TWM updates...')
  logger.info('You\'re running TWM v' + pjson.version)

  try {
    const response = await axios.get(REPOSITORY_URL)

    const latestTag = response.data[0].name
    const currentVer = pjson.version

    if (semver.gt(latestTag, currentVer)) {
      logger.warn(`A new version of TWM is available (v${latestTag}). Run the git pull command or download the new version from here: https://github.com/Reishimanfr/The-World-Machine-Bot/`)
      return
    } else {
      logger.info(`You're running the lastest version of TWM!`)
    }
  } catch (error) {
    logger.error(`Failed to perform version checking. I can\'t determine if you're running the newest version of TWM!\n${error.stack}`)
    return null
  }
}

const Ready: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: ExtClient) => {
    await checkIfNewVersionAvailable()

    client.poru.init(client)
    logger.info(`${client.user?.username} is online.`)
  }
}

export default Ready
