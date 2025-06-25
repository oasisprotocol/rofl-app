import { useContext } from 'react'
import { RouterPathfinderContext } from './RouterPathfinderContext'

export const useRouterPathfinder = () => {
  const value = useContext(RouterPathfinderContext)
  if (Object.keys(value).length === 0) {
    throw new Error('[useRouterPathfinder] Component not wrapped within a Provider')
  }

  return value
}
