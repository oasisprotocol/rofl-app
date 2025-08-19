import { type FC, useEffect, useState } from 'react'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import type { AppData, MetadataFormData } from './types'
import { useCreateAndDeployApp } from '../../backend/api'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { useNetwork } from '../../hooks/useNetwork'
import { Steps } from './AnimatedStepText'
import { BuildFormData } from '../../types/build-form'

// TEMP
export type Template = {
  name: string
  description: string
  image: string
  id: string
  initialValues: {
    metadata: Partial<MetadataFormData>
    build: Partial<BuildFormData>
  }
  yaml: {
    compose: string
    rofl: Record<string, unknown>
  }
}

type BootstrapStepProps = {
  appData?: AppData
  template: Template | undefined
}

type BootstrapState = (typeof BootstrapState)[keyof typeof BootstrapState]

export const BootstrapState = {
  Pending: 'pending', // look at createAndDeployAppMutation.progress.currentStep
  Success: 'success',
  Error: 'error',
} as const

export const BootstrapStep: FC<BootstrapStepProps> = ({ appData, template }) => {
  const network = useNetwork()
  const [buildTriggered, setBuildTriggered] = useState(false)
  const [bootstrapStep, setBootstrapStep] = useState<BootstrapState>(BootstrapState.Pending)
  const { token } = useRoflAppBackendAuthContext()

  const createAndDeployAppMutation = useCreateAndDeployApp()

  // Without useEffect onSuccess and onError will not be called
  useEffect(() => {
    if (!buildTriggered && token && appData && template && network) {
      setBuildTriggered(true)
      createAndDeployAppMutation.mutate(
        {
          token: token!,
          template,
          appData,
          network,
        },
        {
          onSuccess: returnedAppId => {
            console.log('App created and deployed successfully with ID:', returnedAppId)
            setBootstrapStep(BootstrapState.Success)
          },
          onError: error => {
            console.log('Failed to create and deploy app:', error)
            setBootstrapStep(BootstrapState.Error)
          },
        },
      )
    }
  }, [buildTriggered, token, appData, template, network, createAndDeployAppMutation])

  return (
    <Layout headerContent={<Header />} footerContent={<Footer />}>
      <Steps progress={createAndDeployAppMutation.progress} bootstrapStep={bootstrapStep} />
    </Layout>
  )
}
