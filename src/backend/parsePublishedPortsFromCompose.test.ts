import { describe, it, expect } from 'vitest'
import { parsePublishedPortsFromCompose } from './parsePublishedPortsFromCompose'

describe('parsePublishedPortsFromCompose', () => {
  describe('publishedPortFromMapping', () => {
    const testCases = [
      { value: '80', expected: undefined, description: 'single port without colon' },
      { value: '80:8080', expected: '80', description: 'standard port mapping' },
      { value: '80-90:8080', expected: '80-90', description: 'port range mapping' },
      { value: '8080:80/tcp', expected: '8080', description: 'TCP protocol specified' },
      { value: '80:8080/udp', expected: undefined, description: 'UDP protocol - should be undefined' },
      { value: '80-81:8080-8081/tcp', expected: '80-81', description: 'TCP port range' },
      {
        value: '80-82:8080-8082/udp',
        expected: undefined,
        description: 'UDP port range - should be undefined',
      },
      { value: '80-82:8080/udp', expected: undefined, description: 'UDP with range - should be undefined' },
      { value: '80-80:8080/tcp', expected: '80-80', description: 'single port as range with TCP' },
      { value: '9999999', expected: undefined, description: 'very large port number' },
      { value: '80/xyz', expected: undefined, description: 'invalid protocol' },
      { value: 'tcp', expected: undefined, description: 'just protocol name' },
      { value: 'udp', expected: undefined, description: 'just UDP protocol' },
      { value: '', expected: undefined, description: 'empty string' },
      { value: '1.1.1.1:80:80', expected: '80', description: 'IPv4 with port mapping' },
      { value: '::1:6001:6002', expected: '6001', description: 'IPv6 localhost' },
      { value: '[::1]:6001:6002', expected: '6001', description: 'IPv6 localhost with brackets' },
      {
        value: '[2001:aa:bb:cc:dd:ee:ff:1]:6001:6002',
        expected: '6001',
        description: 'full IPv6 address with brackets',
      },
    ]

    testCases.forEach(test => {
      it(`should handle ${test.description}: "${test.value}"`, () => {
        // Create a minimal compose with this port mapping
        const composeYaml = `services:
  test:
    ports:
      - "${test.value}"`
        const result = parsePublishedPortsFromCompose(composeYaml)
        if (test.expected === undefined) {
          expect(result).toHaveLength(0)
        } else {
          expect(result).toHaveLength(1)
          expect(result[0].Port).toBe(test.expected)
        }
      })
    })
  })

  describe('full compose parsing', () => {
    it('should parse valid port mappings from compose file', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
              - "443:8443"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        ServiceName: 'web',
        Port: '80',
        ProxyMode: undefined,
        GenericDomain: 'p80',
        CustomDomain: undefined,
      })
      expect(result[1]).toEqual({
        ServiceName: 'web',
        Port: '443',
        ProxyMode: undefined,
        GenericDomain: 'p443',
        CustomDomain: undefined,
      })
    })

    it('should handle multiple services', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
          api:
            image: api
            ports:
              - "3000:3000"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(2)
      expect(result[0].ServiceName).toBe('web')
      expect(result[1].ServiceName).toBe('api')
    })

    it('should return empty array for services without ports', () => {
      const composeYaml = `
        services:
          worker:
            image: worker
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(0)
    })

    it('should handle empty compose file', () => {
      const composeYaml = `
        services: {}
      `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(0)
    })

    it('should ignore ports with proxy mode "ignore"', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
            annotations:
              net.oasis.proxy.ports.80.mode: ignore
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(0)
    })

    it('should parse custom domain from annotations', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
            annotations:
              net.oasis.proxy.ports.80.custom_domain: custom.example.com
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(1)
      expect(result[0].CustomDomain).toBe('custom.example.com')
    })

    it('should parse both proxy mode and custom domain', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
            annotations:
              net.oasis.proxy.ports.80.mode: terminate-tls
              net.oasis.proxy.ports.80.custom_domain: custom.example.com
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(1)
      expect(result[0].ProxyMode).toBe('terminate-tls')
      expect(result[0].CustomDomain).toBe('custom.example.com')
    })

    it('should filter out invalid port mappings', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80"           # invalid - no published port
              - "80:8080"      # valid
              - "443:8443/udp" # invalid - UDP
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(1)
      expect(result[0].Port).toBe('80')
    })

    it('should handle port ranges', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80-82:8080-8082"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(1)
      expect(result[0].Port).toBe('80-82')
      expect(result[0].GenericDomain).toBe('p80-82')
    })

    it('should handle IPv4 address mappings', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "1.1.1.1:80:8080"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(1)
      expect(result[0].Port).toBe('80')
    })

    it('should handle IPv6 address mappings', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "[::1]:80:8080"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(1)
      expect(result[0].Port).toBe('80')
    })

    it('should handle object notation for ports', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - published: 80
                target: 8080
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(1)
      expect(result[0].Port).toBe('80')
    })

    it('should handle mixed port notation', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
              - published: 443
                target: 8443
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(2)
    })

    it('should handle numeric port notation (returns undefined)', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - 80
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle service with no annotations', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result[0].ProxyMode).toBeUndefined()
      expect(result[0].CustomDomain).toBeUndefined()
    })

    it('should handle service with empty annotations', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080"
            annotations: {}
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result[0].ProxyMode).toBeUndefined()
      expect(result[0].CustomDomain).toBeUndefined()
    })

    it('should handle malformed YAML gracefully', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result).toHaveLength(0)
    })

    it('should handle port with multiple slashes', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80:8080/tcp/tcp"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      // This should be filtered out as it has multiple slashes
      expect(result).toHaveLength(0)
    })
  })

  describe('generic domain generation', () => {
    it('should generate generic domain with "p" prefix', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "8080:80"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result[0].GenericDomain).toBe('p8080')
    })

    it('should generate generic domain for port ranges', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "8000-8010:80"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result[0].GenericDomain).toBe('p8000-8010')
    })

    it('should generate generic domain for single port ranges', () => {
      const composeYaml = `
        services:
          web:
            image: nginx
            ports:
              - "80-80:8080/tcp"
        `

      const result = parsePublishedPortsFromCompose(composeYaml)

      expect(result[0].GenericDomain).toBe('p80-80')
    })
  })
})
