export function trimLongString(value: string, trimStart = 6, trimEnd = 6, ellipsis = '…') {
  if (!value) return
  const wantedStart = Math.max(trimStart, 1)
  const wantedEnd = Math.max(trimEnd, 0)
  const trimmedLength = wantedStart + ellipsis.length + wantedEnd
  if (trimmedLength > value.length) return value

  return `${value.slice(0, wantedStart)}${ellipsis}${trimEnd ? value.slice(-wantedEnd) : ''}`
}
