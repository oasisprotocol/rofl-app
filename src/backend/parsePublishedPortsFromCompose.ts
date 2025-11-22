import * as yaml from 'yaml'

// https://docs.docker.com/reference/compose-file/services/#ports
type PortMapping = string | number | { published?: string | number /* ignore other props */ }

// Try to match Go code https://github.com/oasisprotocol/cli/blob/61749d6/cmd/rofl/build/validate.go#L182-L203
export function parsePublishedPortsFromCompose(composeYaml: string) {
  const compose = yaml.parse(composeYaml)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.entries<any>(compose.services).flatMap(([serviceName, service]) => {
    if (!service.ports) return []
    return (service.ports as PortMapping[]).flatMap(portMapping => {
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

function publishedPortFromMapping(portMapping: PortMapping) {
  if (typeof portMapping === 'number') return undefined
  if (typeof portMapping === 'object') return portMapping.published?.toString()
  if (typeof portMapping !== 'string' || portMapping === '') return undefined

  // https://github.com/oasisprotocol/cli/blob/61749d6/cmd/rofl/build/validate.go#L182
  if (portMapping.replace('/tcp', '').includes('/')) return undefined
  if (portMapping.replace('/tcp', '').split(':').length <= 1) return undefined
  return portMapping.replace('/tcp', '').split(':').slice(-2)[0]
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
  { value: '::1:6001:6002', expected: '6001' },
  { value: '[::1]:6001:6002', expected: '6001' },
  { value: '[2001:aa:bb:cc:dd:ee:ff:1]:6001:6002', expected: '6001' },
]
testCases.forEach(test => {
  const result = publishedPortFromMapping(test.value)
  if (result !== test.expected) {
    throw new Error(`Test "${test.value}" FAILED. Expected: "${test.expected}", Got: "${result}".`)
  }
})
