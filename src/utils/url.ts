const validProtocols = ['http:', 'https:', 'ipfs:', 'data:']

export const isUrlSafe = (url: string | undefined): boolean => {
  if (!url) {
    return false
  }

  try {
    const parsedUrl = new URL(url)
    return validProtocols.includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

export const getHostname = (url: string | undefined): string => {
  if (!url) {
    return ''
  }

  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname
  } catch {
    return ''
  }
}
