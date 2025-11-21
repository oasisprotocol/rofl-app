import { type FC, useEffect } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { AppDataInputs, type MetadataFormData } from './types'
import { ERC8004Form } from './ERC8004Form.tsx'

type CustomInputsStepProps = {
  handleNext: () => void
  handleBack: () => void
  metadata?: MetadataFormData
  inputs?: AppDataInputs
  setAppDataForm: (data: { inputs: AppDataInputs }) => void
  selectedTemplateName?: string
  selectedTemplateId?: string
  customStepTitle: string
}

export const ERC8004Step: FC<CustomInputsStepProps> = ({
  handleNext,
  handleBack,
  metadata,
  inputs,
  setAppDataForm,
  selectedTemplateName,
  selectedTemplateId,
  customStepTitle,
}) => {
  useEffect(() => {
    if (selectedTemplateId === 'custom-build') {
      handleNext()
    }
  }, [handleNext, selectedTemplateId])

  if (selectedTemplateId === 'custom-build') {
    return null
  }

  return (
    <CreateLayout
      currentStep={3}
      selectedTemplateName={selectedTemplateName}
      selectedTemplateId={selectedTemplateId}
      customStepTitle={customStepTitle}
    >
      <CreateFormHeader title={customStepTitle} />
      <ERC8004Form
        handleNext={handleNext}
        handleBack={handleBack}
        metadata={metadata}
        inputs={inputs}
        setAppDataForm={erc8004Inputs => {
          setAppDataForm({
            inputs: {
              ...inputs,
              secrets: {
                ...inputs!.secrets,
                ...erc8004Inputs.inputs.secrets,
              },
            } as AppDataInputs,
          })
        }}
      />
    </CreateLayout>
  )
}
