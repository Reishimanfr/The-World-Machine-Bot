import { type Track } from 'poru'
import { type ExtPlayer } from '../../Helpers/ExtendedClasses'
import { logger } from '../../Helpers/Logger'
import type Event from '../../types/Event'

const TrackError: Event = {
  name: 'trackError',
  once: false,
  execute: async (player: ExtPlayer, track: Track, error: Error) => {
    logger.error(error, 'Error while playing track')
  }
}

export default TrackError
