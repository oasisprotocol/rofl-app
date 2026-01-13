export const appDetailsPath = (appId: string) => `/dashboard/apps/${appId}`
export const appDetailsNewMachinePath = (appId: string) => `/dashboard/apps/${appId}/new-machine`
export const appsPath = () => `/dashboard/apps`
export const createPath = () => `/create`
export const dashboardPath = () => `/dashboard`
export const explorePath = () => `/explore`
export const machineDetailsPath = (provider: string, machineId: string) =>
  `/dashboard/machines/${provider}/instances/${machineId}`
export const machineDetailsTopUpPath = (provider: string, machineId: string) =>
  `/dashboard/machines/${provider}/instances/${machineId}/top-up`
export const machinesPath = () => `/dashboard/machines`
export const templatesPath = () => `/templates`
