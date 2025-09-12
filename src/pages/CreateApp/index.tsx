import { type FC, useEffect, useRef } from 'react'
import { useCreate } from './useCreate'
import { TemplateStep } from './TemplateStep'
import { MetadataStep } from './MetadataStep'
import { CustomInputsStep } from './CustomInputsStep'
import { BuildStep } from './BuildStep'
import { PaymentStep } from './PaymentStep'
import { BootstrapStep } from './BootstrapStep'
import { getCustomTemplate, getTemplateById } from './templates'
import { trackEvent } from 'fathom-client'
import type { CustomBuildFormData } from './types'

export const Create: FC = () => {
  const { currentStep, setCurrentStep, appData, setAppDataForm } = useCreate()
  const steps = [
    { component: TemplateStep },
    { component: MetadataStep },
    { component: CustomInputsStep },
    { component: BuildStep },
    { component: PaymentStep },
    { component: BootstrapStep },
  ]
  const selectedTemplate =
    appData?.templateId === 'custom-build'
      ? getCustomTemplate(appData?.templateId, (appData.inputs as CustomBuildFormData)?.compose)
      : getTemplateById(appData?.templateId)
  const trackedEvents = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (currentStep === 1 && !trackedEvents.current.has(1)) {
      // Filter out just visiting create app page, hence step=1
      trackEvent(`Create app flow/1/start/${appData?.templateId}`)
      trackedEvents.current.add(1)
    } else if (currentStep === 2 && !trackedEvents.current.has(2)) {
      trackEvent(`Create app flow/2/metadata/${appData?.templateId}`)
      trackedEvents.current.add(2)
    } else if (currentStep === 3 && !trackedEvents.current.has(3)) {
      trackEvent(`Create app flow/3/agent/${appData?.templateId}`)
      trackedEvents.current.add(3)
    } else if (currentStep === 4 && !trackedEvents.current.has(4)) {
      trackEvent(`Create app flow/4/payment/${appData?.templateId}`)
      trackedEvents.current.add(4)
    }
  }, [currentStep, appData?.templateId])

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
        <CustomInputsStep
          handleNext={handleNext}
          handleBack={handleBack}
          customInputs={appData?.inputs}
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
