import { logger } from "../../Helpers/Logger";
import { poruOptions } from "../../config";

const NodeError = {
  name: 'nodeError',
  once: false,
  execute: (node, event) => {
    logger.error(
      `Node ${node.name} encountered a error. Attempting to reconnect in ${
        (poruOptions.reconnectTimeout ?? 0) / 1000
      }s`,
    );
    logger.error(event);
  }
}

export default NodeError