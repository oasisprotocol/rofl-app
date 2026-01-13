export const appDetailsPath = (network: string, appId: string) => `/${network}/dashboard/apps/${appId}`
export const appDetailsNewMachinePath = (network: string, appId: string) =>
  `/${network}/dashboard/apps/${appId}/new-machine`
export const appsPath = (network: string) => `/${network}/dashboard/apps`
export const createPath = () => `/create`
export const dashboardPath = (network: string) => `/${network}/dashboard`
export const explorePath = () => `/explore`
export const machineDetailsPath = (network: string, provider: string, machineId: string) =>
  `/${network}/dashboard/machines/${provider}/instances/${machineId}`
export const machineDetailsTopUpPath = (network: string, provider: string, machineId: string) =>
  `/${network}/dashboard/machines/${provider}/instances/${machineId}/top-up`
export const machinesPath = (network: string) => `/${network}/dashboard/machines`
export const templatesPath = () => `/templates`
