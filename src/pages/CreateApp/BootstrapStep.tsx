import { type FC, useEffect, useState } from 'react'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Header } from '../../components/Layout/Header'
import { Footer } from '../../components/Layout/Footer'
import type { AppData, MetadataFormData } from './types'
import { useCreateAndDeployApp } from '../../backend/api'
import { useRoflAppBackendAuthContext } from '../../contexts/RoflAppBackendAuth/hooks'
import { useNetwork } from '../../hooks/useNetwork'
import { AnimatedStepText, HeaderSteps } from './AnimatedStepText'
import { useArtifactUploads } from '../../hooks/useArtifactUploads'
import * as yaml from 'yaml'
import { useBlocker } from 'react-router-dom'

// TEMP
export type Template = {
  name: string
  description: string
  image: string
  id: string
  initialValues: {
    metadata: Partial<MetadataFormData>
    build: {
      provider: string
      resources: string
    }
  }
  yaml: {
    compose: string
    rofl: Record<string, unknown>
  }
  templateParser: (
    metadata: Partial<MetadataFormData>,
    network: 'mainnet' | 'testnet',
    appId: string,
  ) => Record<string, unknown>
}

type BootstrapStepProps = {
  appData?: AppData
  template: Template | undefined
}

type BootstrapState = (typeof BootstrapState)[keyof typeof BootstrapState]

export const BootstrapState = {
  CreateAndDeploy: 'create_and_deploy', // look at createAndDeployAppMutation.progress.currentStep
  Artifacts: 'artifacts',
  Success: 'success',
  Error: 'error',
} as const

export const BootstrapStep: FC<BootstrapStepProps> = ({ appData, template }) => {
  const network = useNetwork()
  const [appId, setAppId] = useState('')
  const [buildTriggered, setBuildTriggered] = useState(false)
  const [bootstrapStep, setBootstrapStep] = useState<BootstrapState>(BootstrapState.CreateAndDeploy)
  const { token } = useRoflAppBackendAuthContext()
  useBlocker(bootstrapStep !== 'success' && bootstrapStep !== 'error')

  const createAndDeployAppMutation = useCreateAndDeployApp()

  const rofl =
    appId && template && appData?.metadata ? template.templateParser(appData.metadata, network, appId) : {}
  const roflYaml = yaml.stringify(rofl)
  const composeYaml = template?.yaml.compose || ''

  useArtifactUploads({
    token,
    appId,
    roflYaml,
    composeYaml,
    enabled: bootstrapStep === BootstrapState.Artifacts && !!appId && !!token && !!appData && !!template,
    onSuccess: () => {
      console.log('Artifact uploads completed successfully')
      setBootstrapStep(BootstrapState.Success)
    },
    onError: error => {
      console.error('Failed to upload artifacts:', error)
      setBootstrapStep(BootstrapState.Error)
    },
  })

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
            setAppId(returnedAppId)
            console.log('App created and deployed successfully with ID:', returnedAppId)
            setBootstrapStep(BootstrapState.Artifacts)
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
      <HeaderSteps progress={createAndDeployAppMutation.progress} />
      <div className="w-full px-8 py-12 flex flex-col items-center justify-center">
        {(bootstrapStep === 'create_and_deploy' || bootstrapStep === 'artifacts') && (
          <div className="w-full flex items-center justify-center mb-8">
            {/* mitigate webm black background */}
            <video className="mix-blend-lighten" width="310" height="310" autoPlay muted loop playsInline>
              <source src="https://assets.oasis.io/webm/Oasis-Loader-310x310.webm" type="video/webm" />
            </video>
          </div>
        )}
        <AnimatedStepText
          step={
            bootstrapStep === 'create_and_deploy'
              ? createAndDeployAppMutation.progress.currentStep
              : bootstrapStep
          }
        />
      </div>
    </Layout>
  )
}
