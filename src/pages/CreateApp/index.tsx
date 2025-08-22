import { type FC, useEffect, useRef } from 'react'
import { useCreate } from './useCreate'
import { TemplateStep } from './TemplateStep'
import { MetadataStep } from './MetadataStep'
import { AgentStep } from './AgentStep'
import { BuildStep } from './BuildStep'
import { PaymentStep } from './PaymentStep'
import { BootstrapStep } from './BootstrapStep'
import { getTemplateById } from './templates'
import { trackEvent } from 'fathom-client'

export const Create: FC = () => {
  const { currentStep, setCurrentStep, appData, setAppDataForm } = useCreate()
  const steps = [
    { component: TemplateStep },
    { component: MetadataStep },
    { component: AgentStep },
    { component: BuildStep },
    { component: PaymentStep },
    { component: BootstrapStep },
  ]
  const selectedTemplate = getTemplateById(appData?.template)
  const trackedEvents = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (currentStep === 1 && !trackedEvents.current.has(1)) {
      // Filter out just visiting create app page, hence step=1
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
  }, [currentStep, appData?.template])

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

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      {currentStep === 0 && <TemplateStep handleNext={handleNext} setAppDataForm={setAppDataForm} />}
      {currentStep === 1 && (
        <MetadataStep
          handleNext={handleNext}
          metadata={appData?.metadata}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate?.name}
          selectedTemplateId={selectedTemplate?.id}
        />
      )}
      {currentStep === 2 && (
        <AgentStep
          handleNext={handleNext}
          handleBack={handleBack}
          agent={appData?.agent}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate?.name}
          selectedTemplateId={selectedTemplate?.id}
        />
      )}
      {currentStep === 3 && (
        <BuildStep
          handleNext={handleNext}
          handleBack={handleBack}
          build={appData?.build}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate?.name}
          selectedTemplateId={selectedTemplate?.id}
          selectedTemplateRequirements={{
            tee: selectedTemplate?.yaml.rofl.tee as 'tdx' | 'sgx' | undefined,
            cpus: selectedTemplate?.yaml.rofl.resources.cpus as number | undefined,
            memory: selectedTemplate?.yaml.rofl.resources.memory as number | undefined,
            storage: selectedTemplate?.yaml.rofl.resources.storage.size as number | undefined,
          }}
        />
      )}
      {currentStep === 4 && (
        <PaymentStep
          handleNext={handleNext}
          handleBack={handleBack}
          appData={appData}
          selectedTemplateName={selectedTemplate?.name}
          selectedTemplateId={selectedTemplate?.id}
        />
      )}
      {currentStep === 5 && <BootstrapStep appData={appData} template={selectedTemplate} />}
    </div>
  )
}
