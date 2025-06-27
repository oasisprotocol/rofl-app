import { useGetRuntimeRoflmarketProvidersAddress, useGetRuntimeRoflAppsIdInstances } from '../nexus/api'
import { useNetwork } from './useNetwork'

export const useScheduler = (provider: string) => {
  const network = useNetwork()
  const roflProviderQuery = useGetRuntimeRoflmarketProvidersAddress(network, 'sapphire', provider)
  const { data: providerData } = roflProviderQuery
  const schedulerId = providerData?.data.scheduler
  const roflSchedulerQuery = useGetRuntimeRoflAppsIdInstances(network, 'sapphire', schedulerId ?? '')
  const { data: schedulerData } = roflSchedulerQuery
  const schedulerInstance = schedulerId
    ? schedulerData?.data?.instances.find(instance =>
        providerData?.data?.nodes?.includes(instance.endorsing_node_id),
      )
    : undefined
  const api = schedulerInstance?.metadata?.['net.oasis.scheduler.api'] as string

  return {
    api,
  }
}
