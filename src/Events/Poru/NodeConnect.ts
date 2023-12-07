import { log } from "../../Helpers/Logger"
import Event from "../../types/Event"

const NodeConnect: Event = {
  name: 'nodeConnect',
  once: false,
  execute: (node) => {
    log.info(`${node.name} connected to lavalink server successfully.`)
  }
}

export default NodeConnect