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
  type AppDataInputs,
  ERC8004FormData,
} from './types'
import { CustomBuildSetupForm } from './CustomBuildSetupForm'

type CustomInputsStepProps = {
  handleNext: () => void
  handleBack: () => void
  inputs?: AppDataInputs
  setAppDataForm: (data: { inputs: AppDataInputs }) => void
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
  const setAppDataInputs = (appDataInputs: { inputs: AppDataInputs }) => {
    // Merge secrets, so the ERC-8004 configuration is not overridden
    setAppDataForm({
      inputs: {
        ...(inputs ?? {}),
        ...appDataInputs.inputs,
        secrets: {
          ...(inputs?.secrets ?? {}),
          ...appDataInputs.inputs.secrets,
        },
      } as AppDataInputs,
    })
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
          inputs={inputs as CustomBuildFormData & ERC8004FormData}
          setAppDataForm={setAppDataInputs}
        />
      )}

      {selectedTemplateId === 'tgbot' && (
        <TgbotAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          inputs={inputs as AgentFormData & ERC8004FormData}
          setAppDataForm={setAppDataInputs}
        />
      )}
      {selectedTemplateId === 'x-agent' && (
        <XAgentForm
          handleNext={handleNext}
          handleBack={handleBack}
          inputs={inputs as XAgentFormData & ERC8004FormData}
          setAppDataForm={setAppDataInputs}
        />
      )}
      {selectedTemplateId === 'hl-copy-trader' && (
        <HlCopyTraderForm
          handleNext={handleNext}
          handleBack={handleBack}
          inputs={inputs as HlCopyTraderFormData & ERC8004FormData}
          setAppDataForm={setAppDataInputs}
        />
      )}
    </CreateLayout>
  )
}
