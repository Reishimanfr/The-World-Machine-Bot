import { ExtPlayer } from '../Helpers/ExtendedPlayer'

function constructProgressBar(player: ExtPlayer, full?: boolean) {
  const songProgress = Math.round((player.position / player.currentTrack.info.length) * 100) / 100

  const BEGIN = {
    '0.00': player.icons.b0,
    '0.01': player.icons.b10,
    '0.02': player.icons.b20,
    '0.03': player.icons.b30,
    '0.04': player.icons.b40,
    '0.05': player.icons.b50,
    '0.06': player.icons.b60,
    '0.07': player.icons.b70,
    '0.08': player.icons.b80,
    '0.09': player.icons.b90,
    '0.1': player.icons.b100
  }

  const CENTER = {
    '0': player.icons. c0,
    '1': player.icons. c10,
    '2': player.icons. c20,
    '3': player.icons. c30,
    '4': player.icons. c40,
    '5': player.icons. c50,
    '6': player.icons. c60,
    '7': player.icons. c70,
    '8': player.icons. c80,
    '9': player.icons. c90,
    '10': player.icons.c100
  }

  const END = {
    '0': player.icons.e0,
    '1': player.icons.e10,
    '2': player.icons.e20,
    '3': player.icons.e30,
    '4': player.icons.e40,
    '5': player.icons.e50,
    '6': player.icons.e60,
    '7': player.icons.e70,
    '8': player.icons.e80,
    '9': player.icons.e90,
    '10': player.icons.e100
  }

  let begin: string
  let center: string
  let end: string

  if (songProgress <= 0) {
    return `${BEGIN['0.00']}${CENTER['0'].repeat(8)}${END['0']}`
  }

  console.log(full)

  if (songProgress >= 1 || full) {
    return `${BEGIN['0.1']}${CENTER['10'].repeat(8)}${END['10']}`
  }

  // 10%
  if (songProgress <= 0.1) {
    begin = BEGIN[songProgress]
    center = CENTER['0'].repeat(8)
    end = END['0']
  } else if (songProgress >= 0.1 && songProgress <= 0.9) {
    begin = BEGIN['0.1']

    const repeat = Math.floor(songProgress * 10) % 10
    const rest = songProgress.toString().charAt(3)
    const repeatRest = 8 - repeat

    center = CENTER['10'].repeat(repeat)

    if (parseInt(rest) > 0) {
      center += CENTER[rest]
    }

    if (repeatRest > 0) {
      center += CENTER['0'].repeat(repeatRest)
    }

    end = END['0']
  } else {
    begin = BEGIN['0.1']
    center = CENTER['10'].repeat(8)

    const rest = Math.floor(songProgress * 10) % 10

    end = END[`${rest}`]
  }

  return `${begin}${center}${end}`
}

export default constructProgressBar
