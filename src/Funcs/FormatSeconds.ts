// Format X seconds into either MM:SS or HH:MM:SS format
// (Depending on if hours > 0)
export function formatSeconds(_seconds: number): string {
  const seconds = Math.trunc(_seconds)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')

  let formattedTime = `${formattedMinutes}:${formattedSeconds}`
  if (hours > 0) {
    const formattedHours = hours.toString().padStart(2, '0')
    formattedTime = `${formattedHours}:${formattedTime}`
  }

  return formattedTime
}
