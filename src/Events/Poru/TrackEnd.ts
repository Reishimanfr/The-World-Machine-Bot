import { ExtPlayer } from "../../Helpers/ExtendedClient";
import Event from "../../types/Event";

const TrackEnd: Event = {
  name: 'trackEnd',
  once: false,
  execute: (player: ExtPlayer) => {
    player.pauseEditing = true
  }
}

export default TrackEnd