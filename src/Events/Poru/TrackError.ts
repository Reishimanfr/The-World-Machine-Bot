import { logger } from "../../Helpers/Logger"

const TrackError = {
  name: 'trackError',
  once: false,
  execute: ($, _, error) => {
    logger.error(`Error while playing track: ${error.stack}`)
  }
}

export default TrackError