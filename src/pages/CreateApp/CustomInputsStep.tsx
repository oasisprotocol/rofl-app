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
  inputs?: AgentFormData | XAgentFormData | HlCopyTraderFormData | CustomBuildFormData
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
  inputs,
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
          inputs={inputs as CustomBuildFormData}
          setAppDataForm={setAppDataForm}
        />
      )}

      {selectedTemplateId === 'tgbot' && (
        <TgbotAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          inputs={inputs as AgentFormData}
          setAppDataForm={setAppDataForm}
        />
      )}
      {selectedTemplateId === 'x-agent' && (
        <XAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          inputs={inputs as XAgentFormData}
          setAppDataForm={setAppDataForm}
        />
      )}
      {selectedTemplateId === 'hl-copy-trader' && (
        <HlCopyTraderForm
          handleNext={handleNext}
          handleBack={handleBack}
          inputs={inputs as HlCopyTraderFormData}
          setAppDataForm={setAppDataForm}
        />
      )}
    </CreateLayout>
  )
}
