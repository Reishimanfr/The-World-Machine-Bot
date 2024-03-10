import { logger } from '../../Helpers/Logger'
import { Event } from '../../Types/Event'

const NodeError: Event = {
  name: 'nodeError',
  once: false,
  execute: (node) => {
    logger.error(`Node ${node.name} failed to connect. Attempting to reconnect...`)
  }
}

export default NodeError
