import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { TgbotAgentForm } from './TgbotAgentForm'
import { XAgentForm } from './XAgentForm'
import { HlCopyTraderForm } from './HlCopyTraderForm'
import {
  type AgentFormData,
  type XAgentFormData,
  type HlCopyTraderFormData,
  type CustomBuildFormData,
} from './types'
import { CustomBuildSetupForm } from './CustomBuildSetupForm'

type CustomInputsStepProps = {
  handleNext: () => void
  handleBack: () => void
  customInputs?: AgentFormData | XAgentFormData | HlCopyTraderFormData | CustomBuildFormData
  setAppDataForm: (data: {
    inputs: AgentFormData | XAgentFormData | HlCopyTraderFormData | CustomBuildFormData
  }) => void
  selectedTemplateName?: string
  selectedTemplateId?: string
  customStepTitle: string
}

export const CustomInputsStep: FC<CustomInputsStepProps> = ({
  handleNext,
  handleBack,
  customInputs,
  setAppDataForm,
  selectedTemplateName,
  selectedTemplateId,
  customStepTitle,
}) => {
  const handleSetAppDataForm = (data: {
    agent: AgentFormData | XAgentFormData | HlCopyTraderFormData | CustomBuildFormData
  }) => {
    setAppDataForm({ inputs: data.agent })
  }

  return (
    <CreateLayout
      currentStep={2}
      selectedTemplateName={selectedTemplateName}
      selectedTemplateId={selectedTemplateId}
      customStepTitle={customStepTitle}
    >
      <CreateFormHeader title={customStepTitle} />

      {selectedTemplateId === 'custom-build' && (
        <CustomBuildSetupForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={customInputs as CustomBuildFormData}
          setAppDataForm={handleSetAppDataForm}
        />
      )}

      {selectedTemplateId === 'tgbot' && (
        <TgbotAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={customInputs as AgentFormData}
          setAppDataForm={handleSetAppDataForm}
        />
      )}
      {selectedTemplateId === 'x-agent' && (
        <XAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={customInputs as XAgentFormData}
          setAppDataForm={handleSetAppDataForm}
        />
      )}
      {selectedTemplateId === 'hl-copy-trader' && (
        <HlCopyTraderForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={customInputs as HlCopyTraderFormData}
          setAppDataForm={handleSetAppDataForm}
        />
      )}
    </CreateLayout>
  )
}
