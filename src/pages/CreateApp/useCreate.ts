import { useState } from 'react'
import type { AppData } from './types'

const initAppDataState: AppData = {
  template: '',
  metadata: {
    name: '',
    author: '',
    description: '',
    version: '',
    homepage: '',
  },
  agent: {
    OLLAMA_MODEL: '',
    TOKEN: '',
    OLLAMA_SYSTEM_PROMPT: '',
  },
  build: {
    provider: '',
    duration: 'hours',
    number: 2,
    resources: '',
  },
  payment: {},
}

export const useCreate = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [appData, setAppData] = useState<AppData>(initAppDataState)
  const setAppDataForm = (data: Partial<AppData>) => {
    setAppData(prevData => ({ ...prevData, ...data }))
  }
  const resetStep = () => {
    setCurrentStep(0)
    setAppData(initAppDataState)
  }

  return {
    currentStep,
    setCurrentStep,
    resetStep,
    appData,
    setAppDataForm,
  }
}
