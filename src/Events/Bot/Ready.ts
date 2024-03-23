import { Events } from 'discord.js'
import { logger } from '../../Helpers/Logger'
import { Event } from '../../Types/Event'
import pjson from '../../../package.json'
import axios from 'axios'
import semver from 'semver'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { Bot } from '../../Classes/Bot'
require('dotenv').config()

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
  execute: async (client: Bot) => {
    await checkIfNewVersionAvailable()

    if (process.env.AUTOSTART_LAVALINK === 'true') {
      logger.info('Starting lavalink server...')
      await exec(['java', '-jar', './lavalink.jar'])
    }

    client.poru.init(client)
    logger.info(`${client.user.username} is online.`)
  }
}

export default Ready
