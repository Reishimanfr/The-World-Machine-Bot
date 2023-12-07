import { log } from "../../Helpers/Logger";
import { poruOptions } from "../../config";
import Event from "../../types/Event";

const NodeError: Event = {
  name: 'nodeError',
  once: false,
  execute: (node, event) => {
    log.error(`Node ${node.name} encountered a error. Attempting to reconnect in ${(poruOptions.reconnectTimeout ?? 0) / 1000}s`);
    log.error(event);
  }
}

export default NodeError