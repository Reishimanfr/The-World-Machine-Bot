import { logger } from '../../config'
import { Event } from '../../Types/Event'

const NodeConnect: Event = {
  name: 'nodeConnect',
  once: false,
  execute: (node) => {
    logger.info(`${node.name} connected to lavalink server successfully.`)
  }
}

export default NodeConnect
