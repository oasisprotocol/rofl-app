import { type FC, useEffect } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { AppDataInputs } from './types'
import { ERC8004Form } from './ERC8004Form.tsx'

type CustomInputsStepProps = {
  handleNext: () => void
  handleBack: () => void
  inputs?: AppDataInputs
  setAppDataForm: (data: { inputs: AppDataInputs }) => void
  selectedTemplateName?: string
  selectedTemplateId?: string
  customStepTitle: string
}

export const ERC8004Step: FC<CustomInputsStepProps> = ({
  handleNext,
  handleBack,
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
