import { useQuery } from '@tanstack/react-query'
import {
  GetRuntimeRoflAppsIdInstancesRak,
  GetRuntimeRoflmarketInstances,
  GetRuntimeRoflmarketProvidersAddress,
  RoflMarketInstance,
} from '../nexus/api'
import { isMachineRemoved } from '../components/MachineStatusIcon/isMachineRemoved'
import { RoflmarketDeployment } from '@oasisprotocol/client-rt/dist/types'

const MetadataKeySchedulerRAK = 'net.oasis.scheduler.rak'
const MetadataKeyProxyDomain = 'net.oasis.proxy.domain'
const MetadataKeyProxyCustomDomains = 'net.oasis.proxy.custom_domains'

// Try to match Go code https://github.com/oasisprotocol/cli/blob/61749d6/cmd/rofl/build/validate.go#L26-L44
// PortMapping represents a port mapping.
interface PortMapping {
  // ServiceName is the name of the service.
  ServiceName: string
  // Port is the port number.
  Port: string
  // ProxyMode is the proxy mode for the port.
  ProxyMode: string
  // GenericDomain is the generic domain name.
  GenericDomain: string
  // CustomDomain is the custom domain name (if any).
  CustomDomain?: string
}

// AppExtraConfig represents extra configuration for the ROFL app.
interface AppExtraConfig {
  // Ports are the port mappings exposed by the app.
  Ports: PortMapping[]
}

export function useRoflAppDomains(network: 'mainnet' | 'testnet', appID: string, extraCfg?: AppExtraConfig) {
  const paratime = 'sapphire' as const

  const query = useQuery({
    queryKey: ['useRoflAppDomains', network, appID, paratime, extraCfg],
    queryFn: async () => {
      const appMachines = (await GetRuntimeRoflmarketInstances(network, paratime, { deployed_app_id: appID }))
        .data.instances

      const appDomains: { ServiceName: string; Domain: string }[] = []
      for (const insDsc of appMachines.filter(machine => !isMachineRemoved(machine))) {
        // Try to match Go code https://github.com/oasisprotocol/cli/blob/1cc571e/cmd/rofl/machine/show.go#L102-L109
        const machineID = insDsc.id
        const providerAddr = insDsc.provider

        const providerDsc = (await GetRuntimeRoflmarketProvidersAddress(network, paratime, providerAddr)).data

        const schedulerRAK = insDsc.metadata[MetadataKeySchedulerRAK] as string | undefined
        if (!schedulerRAK) return []
        const schedulerDsc = (
          await GetRuntimeRoflAppsIdInstancesRak(network, paratime, providerDsc.scheduler, schedulerRAK)
        ).data

        const proxyDomain1 = schedulerDsc?.metadata?.[MetadataKeyProxyDomain] as string | undefined
        if (!proxyDomain1) return []
        const numericMachineID = BigInt('0x' + machineID)
        const proxyDomain2 = 'm' + numericMachineID + '.' + proxyDomain1

        appDomains.push(...showMachinePorts(extraCfg ?? impliedExtraCfg(insDsc), appID, insDsc, proxyDomain2))
      }

      return appDomains
    },
  })

  return query
}

// Try to match Go code https://github.com/oasisprotocol/cli/blob/1cc571e/cmd/rofl/machine/show.go#L195-L221
function showMachinePorts(
  extraCfg: AppExtraConfig,
  _appID: string,
  _insDsc: RoflMarketInstance,
  domain: string,
) {
  return extraCfg.Ports.map(p => {
    const genericDomain = p.GenericDomain + '.' + domain
    // TODO: DomainVerificationToken
    return {
      ServiceName: p.ServiceName,
      Domain: 'https://' + (p.CustomDomain ?? genericDomain),
    }
  })
}

function impliedExtraCfg(insDsc: RoflMarketInstance): AppExtraConfig {
  const customDomains = (insDsc.deployment as unknown as RoflmarketDeployment).metadata?.[
    MetadataKeyProxyCustomDomains
  ] as string | undefined

  return {
    Ports: [
      // https://github.com/oasisprotocol/oasis-sdk/blob/777bcc4/rofl-scheduler/src/proxy/mod.rs#L231
      ...(customDomains?.split(' ') || []).map(
        (CustomDomain): PortMapping => ({
          ServiceName: '',
          Port: '<unknown port>',
          GenericDomain: 'p<unknown port>',
          CustomDomain: CustomDomain,
          ProxyMode: 'terminate-tls',
        }),
      ),
      {
        ServiceName: '',
        Port: '<exposed ports>',
        GenericDomain: 'p<exposed ports>',
        ProxyMode: 'terminate-tls',
      },
    ],
  }
}
