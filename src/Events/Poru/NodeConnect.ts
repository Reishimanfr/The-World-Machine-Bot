import { logger } from "../../Helpers/Logger"

const NodeConnect = {
  name: 'nodeConnect', 
  once: false,
  execute: (node) => {
    logger.info(`${node.name} connected to lavalink server successfully.`)
  }
}

export default NodeConnect