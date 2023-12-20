/** Clips a string to a maximum length and appends a string provided by the sliceEnd parameter */
export function clipString(options: {
  string: string,
  maxLength: number,
  sliceEnd: string
}): string {
  const { string, maxLength, sliceEnd } = options
  if (string.length < maxLength) return string

  return string.slice(0, maxLength) + sliceEnd
}