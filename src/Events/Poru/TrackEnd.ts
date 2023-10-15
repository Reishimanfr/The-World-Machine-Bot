import { ExtPlayer } from "../../Helpers/ExtendedClient";

const TrackEnd = {
  name: 'trackEnd',
  once: false,
  execute: (player: ExtPlayer) => {
    player.pauseEditing = true
  }
}

export default TrackEnd