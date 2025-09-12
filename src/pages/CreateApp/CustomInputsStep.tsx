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
    agent: AgentFormData | XAgentFormData | HlCopyTraderFormData | CustomBuildFormData
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
          setAppDataForm={setAppDataForm as (data: { agent: CustomBuildFormData }) => void}
        />
      )}

      {selectedTemplateId === 'tgbot' && (
        <TgbotAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={customInputs as AgentFormData}
          setAppDataForm={setAppDataForm as (data: { agent: AgentFormData }) => void}
        />
      )}
      {selectedTemplateId === 'x-agent' && (
        <XAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={customInputs as XAgentFormData}
          setAppDataForm={setAppDataForm as (data: { agent: XAgentFormData }) => void}
        />
      )}
      {selectedTemplateId === 'hl-copy-trader' && (
        <HlCopyTraderForm
          handleNext={handleNext}
          handleBack={handleBack}
          agent={customInputs as HlCopyTraderFormData}
          setAppDataForm={setAppDataForm as (data: { agent: HlCopyTraderFormData }) => void}
        />
      )}
    </CreateLayout>
  )
}
