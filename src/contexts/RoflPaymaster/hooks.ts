import { useContext } from 'react'
import { RoflPaymasterContext } from './Context.tsx'

export function useRoflPaymasterContext() {
  const context = useContext(RoflPaymasterContext)
  if (Object.keys(context).length === 0) {
    throw new Error('[useRoflPaymasterContext] Component not wrapped within a Provider')
  }
  return context
}
