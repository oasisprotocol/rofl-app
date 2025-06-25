import { useContext } from 'react'
import { CreateContext } from './CreateContext'

export const useCreate = () => {
  const context = useContext(CreateContext)
  return context
}
