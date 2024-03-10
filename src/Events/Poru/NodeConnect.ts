import { logger } from '../../Helpers/Logger'
import { Event } from '../../Types/Event'

const NodeConnect: Event = {
  name: 'nodeConnect',
  once: false,
  execute: (node) => {
    logger.info(`Node ${node.name} connected to lavalink.`)
  }
}

export default NodeConnect
