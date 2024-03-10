import { Events } from 'discord.js'
import { ExtClient } from '../../Helpers/ExtendedClient'
import { logger } from '../../Helpers/Logger'
import { Event } from '../../Types/Event'
import pjson from '../../../package.json'
import axios from 'axios'
import semver from 'semver'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
require('dotenv').config()

async function checkIfNewVersionAvailable() {
  const REPOSITORY_URL = 'https://api.github.com/repos/Reishimanfr/The-World-Machine-Bot/tags'

  logger.info(`Checking for any TWM updates... (currently running version v${pjson.version})`)

  try {
    const response = await axios.get(REPOSITORY_URL)

    const latestTag = response.data[0].name
    const currentVer = pjson.version

    if (semver.gt(latestTag, currentVer)) {
      logger.warn(`A new version of TWM is available (v${latestTag}). Run git pull or download the new version here: https://github.com/Reishimanfr/The-World-Machine-Bot/`)
    } else {
      logger.info('No updates available.')
    }
  } catch (error) {
    logger.error(`Failed to perform version checking. I can't determine if you're running the newest version of TWM!\n${error.stack}`)
  }
}

async function exec(args: string[]): Promise<ChildProcessWithoutNullStreams> {
  const childProcess = spawn(args[0], args.slice(1))

  return new Promise((resolve) => {
    childProcess.stdout.on('data', (data) => {
      if (process.env.PIPE_LAVALINK_STDOUT) {
        logger.debug(`Piped lavalink stdout: ${data.toString()}`)
      }

      if (data.toString().includes('Lavalink is ready to accept connections.')) {
        logger.info('Lavalink server started.')
        resolve(childProcess)
      }
    })

    childProcess.stderr.on('data', (data) => {
      logger.error(`Piped lavalink stderr: ${data.toString()}`)
    })
  })
}

const Ready: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: ExtClient) => {
    await checkIfNewVersionAvailable()

    if (process.env.AUTOSTART_LAVALINK === 'true') {
      logger.info('Starting lavalink server...')
      await exec(['java', '-jar', './lavalink/lavalink.jar'])
    }

    client.poru.init(client)
    logger.info(`${client.user?.username} is online.`)
  }
}

export default Ready
