import { logger } from '../../config'
import { poruOptions } from '../../config'
import type Event from '../../types/Event'

const NodeError: Event = {
  name: 'nodeError',
  once: false,
  execute: (node) => {
    logger.error(`Node ${node.name} failed to connect. Attempting to reconnect in ${(poruOptions.reconnectTimeout ?? 0) / 1000}s`)
  }
}

export default NodeError
