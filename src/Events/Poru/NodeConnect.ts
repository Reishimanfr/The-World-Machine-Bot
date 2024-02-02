import { logger } from '../../Helpers/Logger'
import type Event from '../../types/Event'

const NodeConnect: Event = {
  name: 'nodeConnect',
  once: false,
  execute: (node) => {
    logger.info(`${node.name} connected to lavalink server successfully.`)
  }
}

export default NodeConnect
