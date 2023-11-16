import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import Event from "../../types/Event";

const TrackEnd: Event = {
  name: 'trackEnd',
  once: false,
  execute: (player: ExtPlayer) => {
    player.pauseEditing = true
    const currentTime = player.timeInVc

    player.timeInVc = currentTime + Math.trunc(player.previousTrack.info.length / 1000)
  }
}

export default TrackEnd