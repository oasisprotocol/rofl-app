import { useState } from 'react'
import type { AppData } from './types'
import { useNetwork } from '../../hooks/useNetwork'

const initAppDataState = (network: 'testnet' | 'mainnet'): AppData => ({
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
    WITHDRAW: 'false',
  },
  network: network,
  build: {
    provider: '',
    duration: 'hours',
    number: 2,
    offerId: '',
    offerCpus: 0,
    offerMemory: 0,
    offerStorage: 0,
  },
})

export const useCreate = () => {
  const network = useNetwork()
  const [currentStep, setCurrentStep] = useState(0)
  const [appData, setAppData] = useState<AppData>(() => initAppDataState(network))
  const setAppDataForm = (data: Partial<AppData>) => {
    setAppData(prevData => ({ ...prevData, ...data }))
  }
  const resetStep = () => {
    setCurrentStep(0)
    setAppData(initAppDataState(network))
  }

  if (appData.network !== network) {
    setCurrentStep(step => (step > 3 ? 3 : step))
    // If user switches chain then reset provider + offer id
    const initData = initAppDataState(network)
    setAppData(prevData => ({
      ...initData,
      template: prevData.template,
      metadata: prevData.metadata,
      agent: prevData.agent,
      // reset network
      // reset build
    }))
  }

  return {
    currentStep,
    setCurrentStep,
    resetStep,
    appData,
    setAppDataForm,
  }
}
