// Formats seconds into {X hours Y minutes Z seconds}
function FormatTime(seconds: number | string): string {
  if (typeof seconds == 'string') {
    seconds = parseInt(seconds)
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  let result = ''

  if (hours > 0) {
    result += `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }

  if (minutes > 0) {
    if (result !== '') {
      result += ' '
    }
    result += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
  }

  if (remainingSeconds > 0) {
    if (result !== '') {
      result += ' '
    }
    result += `${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`
  }

  return `${result}`
}

export default FormatTime