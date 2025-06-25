import { createContext } from 'react'
import type { AppData } from './types'

type CreateContextType = {
  currentStep: number
  setCurrentStep: (step: number) => void
  resetStep: () => void
  appData?: AppData
  setAppDataForm: (data: Partial<AppData>) => void
}

export const CreateContext = createContext<CreateContextType | undefined>(undefined)
