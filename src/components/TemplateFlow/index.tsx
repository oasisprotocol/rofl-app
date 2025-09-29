import { type FC, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { trackEvent } from 'fathom-client'
import { Header } from '../Layout/Header'
import { Footer } from '../Layout/Footer'
import { TemplatesList } from '../TemplatesList'
import { RainbowKitConnectButton } from '../RainbowKitConnectButton'
import { useCreate } from '../../pages/CreateApp/useCreate'
import { TemplateStep } from '../../pages/CreateApp/TemplateStep'
import { MetadataStep } from '../../pages/CreateApp/MetadataStep'
import { AgentStep } from '../../pages/CreateApp/AgentStep'
import { BuildStep } from '../../pages/CreateApp/BuildStep'
import { PaymentStep } from '../../pages/CreateApp/PaymentStep'
import { BootstrapStep } from '../../pages/CreateApp/BootstrapStep'
import { getTemplateById } from '../../pages/CreateApp/templates'

interface TemplateFlowProps {
  mode?: 'browse' | 'create'
}

export const TemplateFlow: FC<TemplateFlowProps> = ({ mode }) => {
  const location = useLocation()
  const { isConnected } = useAccount()

  const flowMode = mode || (location.pathname.startsWith('/create') ? 'create' : 'browse')

  const { currentStep, setCurrentStep, appData, setAppDataForm } = useCreate()
  const trackedEvents = useRef<Set<number>>(new Set())

  const steps = [
    { component: TemplateStep },
    { component: MetadataStep },
    { component: AgentStep },
    { component: BuildStep },
    { component: PaymentStep },
    { component: BootstrapStep },
  ]

  const selectedTemplate = getTemplateById(appData?.template)

  useEffect(() => {
    if (flowMode !== 'create') return

    if (currentStep === 1 && !trackedEvents.current.has(1)) {
      trackEvent(`Create app flow/1/start/${appData?.template}`)
      trackedEvents.current.add(1)
    } else if (currentStep === 2 && !trackedEvents.current.has(2)) {
      trackEvent(`Create app flow/2/metadata/${appData?.template}`)
      trackedEvents.current.add(2)
    } else if (currentStep === 3 && !trackedEvents.current.has(3)) {
      trackEvent(`Create app flow/3/agent/${appData?.template}`)
      trackedEvents.current.add(3)
    } else if (currentStep === 4 && !trackedEvents.current.has(4)) {
      trackEvent(`Create app flow/4/payment/${appData?.template}`)
      trackedEvents.current.add(4)
    }
  }, [flowMode, currentStep, appData?.template])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (flowMode === 'browse') {
    return (
      <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
        <Layout headerContent={<Header />} footerContent={<Footer />}>
          <div className="mx-auto px-8 py-12">
            <div className="mb-10">
              <h1 className="text-2xl font-white font-bold text-center mb-8">
                Create your app from a template
              </h1>
              <div className="text-center">
                <RainbowKitConnectButton>
                  {({ openConnectModal }) => {
                    return isConnected ? (
                      <Button size="lg" asChild>
                        <Link to="/create">
                          Get started
                          <ArrowRight />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          openConnectModal()
                        }}
                        className="max-md:w-full"
                      >
                        Connect Wallet
                        <ArrowRight />
                      </Button>
                    )
                  }}
                </RainbowKitConnectButton>
              </div>
            </div>
            <Separator className="my-8" />
            <TemplatesList />
          </div>
        </Layout>
      </div>
    )
  }

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      {currentStep === 0 && <TemplateStep handleNext={handleNext} setAppDataForm={setAppDataForm} />}
      {currentStep === 1 && selectedTemplate && (
        <MetadataStep
          handleNext={handleNext}
          metadata={appData?.metadata}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate.name}
          selectedTemplateId={selectedTemplate.id}
          customStepTitle={selectedTemplate.customStepTitle}
        />
      )}
      {currentStep === 2 && selectedTemplate && (
        <AgentStep
          handleNext={handleNext}
          handleBack={handleBack}
          agent={appData?.agent}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate.name}
          selectedTemplateId={selectedTemplate.id}
          customStepTitle={selectedTemplate.customStepTitle}
        />
      )}
      {currentStep === 3 && selectedTemplate && (
        <BuildStep
          handleNext={handleNext}
          handleBack={handleBack}
          build={appData?.build}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate?.name}
          selectedTemplateId={selectedTemplate?.id}
          selectedTemplateRequirements={{
            tee: selectedTemplate.yaml.rofl.tee as 'tdx' | 'sgx' | undefined,
            cpus: selectedTemplate.yaml.rofl.resources.cpus as number | undefined,
            memory: selectedTemplate.yaml.rofl.resources.memory as number | undefined,
            storage: selectedTemplate.yaml.rofl.resources.storage.size as number | undefined,
          }}
          customStepTitle={selectedTemplate.customStepTitle}
        />
      )}
      {currentStep === 4 && selectedTemplate && (
        <PaymentStep
          handleNext={handleNext}
          handleBack={handleBack}
          appData={appData}
          selectedTemplateName={selectedTemplate.name}
          selectedTemplateId={selectedTemplate.id}
          customStepTitle={selectedTemplate.customStepTitle}
        />
      )}
      {currentStep === 5 && <BootstrapStep appData={appData} template={selectedTemplate} />}
    </div>
  )
}
