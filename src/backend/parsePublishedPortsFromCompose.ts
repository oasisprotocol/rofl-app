import * as yaml from 'yaml'

// Try to match Go code https://github.com/oasisprotocol/cli/blob/61749d6/cmd/rofl/build/validate.go#L182-L203
export function parsePublishedPortsFromCompose(composeYaml: string) {
  const compose = yaml.parse(composeYaml)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.entries<any>(compose.services).flatMap(([serviceName, service]) => {
    if (!service.ports) return []
    return (service.ports as string[]).flatMap((portMapping: string) => {
      const portPublished = publishedPortFromMapping(portMapping)
      if (!portPublished) return []
      const proxyMode = service.annotations?.[`net.oasis.proxy.ports.${portPublished}.mode`]
      if (proxyMode === 'ignore') return []
      const genericDomain = 'p' + portPublished
      const customDomain: string =
        service.annotations?.[`net.oasis.proxy.ports.${portPublished}.custom_domain`]

      return [
        {
          ServiceName: serviceName,
          Port: portPublished,
          ProxyMode: proxyMode,
          GenericDomain: genericDomain,
          CustomDomain: customDomain,
        },
      ]
    })
  })
}

function publishedPortFromMapping(portMapping: string) {
  if (typeof portMapping !== 'string' || portMapping === '') return undefined

  // Regex to match and capture the host port only when a container port mapping is present.
  // (?:(?:\d{1,3}\.){3}\d{1,3}:)?      - Optional non-capturing group for an IP address and colon
  // (\d+(?:-\d+)?)                     - CAPTURE GROUP 1: The host port or port range (e.g., "80", "80-90")
  // :                                  - REQUIRED colon, indicating a port mapping
  // \d+(?:-\d+)?                       - The container port or port range
  // (?:(?:\/tcp)?)                     - Optional non-capturing group for protocol /tcp
  //   https://github.com/oasisprotocol/cli/blob/61749d6/cmd/rofl/build/validate.go#L182
  const match = portMapping.match(
    /^(?:(?:\d{1,3}\.){3}\d{1,3}:)?(\d+(?:-\d+)?):(?:\d+(?:-\d+)?(?:(?:\/tcp)?))?$/,
  )

  return match ? match[1] : undefined
}

// TODO: move into vitest
// Adjusted from https://github.com/compose-spec/compose-go/blob/61f9cea/types/types_test.go#L32-L199
const testCases = [
  { value: '80', expected: undefined },
  { value: '80:8080', expected: '80' },
  { value: '80-90:8080', expected: '80-90' },
  { value: '8080:80/tcp', expected: '8080' },
  { value: '80:8080/udp', expected: undefined },
  { value: '80-81:8080-8081/tcp', expected: '80-81' },
  { value: '80-82:8080-8082/udp', expected: undefined },
  { value: '80-82:8080/udp', expected: undefined },
  { value: '80-80:8080/tcp', expected: '80-80' },
  { value: '9999999', expected: undefined },
  { value: '80/xyz', expected: undefined },
  { value: 'tcp', expected: undefined },
  { value: 'udp', expected: undefined },
  { value: '', expected: undefined },
  { value: '1.1.1.1:80:80', expected: '80' },
]
testCases.forEach(test => {
  const result = publishedPortFromMapping(test.value)
  if (result !== test.expected) {
    throw new Error(`Test "${test.value}" FAILED. Expected: "${test.expected}", Got: "${result}".`)
  }
})
