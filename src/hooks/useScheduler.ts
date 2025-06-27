import { useGetRuntimeRoflmarketProvidersAddress, useGetRuntimeRoflAppsIdInstances } from '../nexus/api'
import { useNetwork } from './useNetwork'

export const useScheduler = (schedulerRak: string, provider: string) => {
  const network = useNetwork()
  const roflProviderQuery = useGetRuntimeRoflmarketProvidersAddress(network, 'sapphire', provider)
  const { data: providerData } = roflProviderQuery
  const schedulerId = providerData?.data.scheduler
  const roflSchedulerQuery = useGetRuntimeRoflAppsIdInstances(network, 'sapphire', schedulerId ?? '')
  const { data: schedulerData } = roflSchedulerQuery
  const schedulerInstance = schedulerId
    ? schedulerData?.data?.instances.find(instance => instance.rak === schedulerRak)
    : undefined
  const api = schedulerInstance?.metadata?.['net.oasis.scheduler.api'] as string

  return {
    api,
  }
}
