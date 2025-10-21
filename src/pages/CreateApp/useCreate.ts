import { useState, useEffect } from 'react'
import type { AppData } from './types'
import { useNetwork } from '../../hooks/useNetwork'

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
    WITHDRAW: 'false',
  },
  build: {
    provider: '',
    duration: 'hours',
    number: 2,
    offerId: '',
    offerCpus: 0,
    offerMemory: 0,
    offerStorage: 0,
  },
  payment: {},
}

export const useCreate = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [appData, setAppData] = useState<AppData>({ ...initAppDataState })
  const [previousNetwork, setPreviousNetwork] = useState<'mainnet' | 'testnet' | null>(null)
  const network = useNetwork('mainnet') // fallback to mainnet

  const setAppDataForm = (data: Partial<AppData>) => {
    setAppData(prevData => ({ ...prevData, ...data }))
  }

  const resetStep = () => {
    setCurrentStep(0)
    setAppData(initAppDataState)
    setPreviousNetwork(null)
  }

  useEffect(() => {
    if (previousNetwork !== null && previousNetwork !== network) {
      setAppData(prevData => ({
        ...prevData,
        build: {
          provider: '',
          duration: 'hours',
          number: 2,
          offerId: '',
          offerCpus: 0,
          offerMemory: 0,
          offerStorage: 0,
        },
      }))

      // TODO: Should we reset the deploy step if the network changes?
      if (currentStep > 3) {
        setCurrentStep(3)
      }
    }
    setPreviousNetwork(network)
  }, [network, previousNetwork, currentStep])

  return {
    currentStep,
    setCurrentStep,
    resetStep,
    appData,
    setAppDataForm,
    network,
  }
}
