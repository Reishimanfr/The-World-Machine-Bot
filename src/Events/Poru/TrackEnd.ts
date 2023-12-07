import { queueHistory } from "../../Data/DatabaseSchema";
import { ExtPlayer } from "../../Helpers/ExtendedClasses";
import Event from "../../types/Event";

const TrackEnd: Event = {
  name: 'trackEnd',
  once: false,
  execute: async (player: ExtPlayer) => {
    const currentTime = player.timeInVc
    player.timeInVc = currentTime + Math.trunc(player.previousTrack.info.length / 1000)

    const [record] = await queueHistory.findOrCreate({
      where: { UUID: player.sessionId },
      defaults: { UUID: player.sessionId, entries: '' }
    })

    const currentEntries = record?.getDataValue('entries') ?? ''
    const info = player.currentTrack.info

    const addData = {
      title: info.title,
      author: info.author,
      uri: info.uri,
      length: info.length,
      requester: info.requester.id
    }

    const newEntries = `${currentEntries}${JSON.stringify(addData)}/split/`

    await record.update({ entries: newEntries })
  }
}

export default TrackEnd