import { type FC } from 'react'
import { useCreate } from './useCreate'
import { TemplateStep } from './TemplateStep'
import { MetadataStep } from './MetadataStep'
import { AgentStep } from './AgentStep'
import { BuildStep } from './BuildStep'
import { PaymentStep } from './PaymentStep'
import { BootstrapStep } from './BootstrapStep'
import { getTemplateById } from './templates'

export const Create: FC = () => {
  const context = useCreate()

  if (!context) {
    return <div>Error: CreateContext not found</div>
  }

  const { currentStep, setCurrentStep, appData, setAppDataForm } = context
  const steps = [
    { component: TemplateStep },
    { component: MetadataStep },
    { component: AgentStep },
    { component: BuildStep },
    { component: PaymentStep },
    { component: BootstrapStep },
  ]

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

  const selectedTemplate = getTemplateById(appData?.template)

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      {currentStep === 0 && <TemplateStep handleNext={handleNext} setAppDataForm={setAppDataForm} />}
      {currentStep === 1 && (
        <MetadataStep
          handleNext={handleNext}
          metadata={appData?.metadata}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate?.name}
        />
      )}
      {currentStep === 2 && (
        <AgentStep
          handleNext={handleNext}
          handleBack={handleBack}
          agent={appData?.agent}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate?.name}
        />
      )}
      {currentStep === 3 && (
        <BuildStep
          handleNext={handleNext}
          handleBack={handleBack}
          build={appData?.build}
          setAppDataForm={setAppDataForm}
          selectedTemplateName={selectedTemplate?.name}
        />
      )}
      {currentStep === 4 && (
        <PaymentStep
          handleNext={handleNext}
          handleBack={handleBack}
          appData={appData}
          selectedTemplateName={selectedTemplate?.name}
        />
      )}
      {currentStep === 5 && <BootstrapStep appData={appData} template={selectedTemplate} />}
    </div>
  )
}
