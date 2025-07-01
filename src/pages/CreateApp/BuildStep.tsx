import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { BuildForm } from '../../components/BuildForm'
import { BuildFormData } from '../../types/build-form.ts'

type AgentStepProps = {
  handleNext: () => void
  handleBack: () => void
  build?: BuildFormData
  setAppDataForm: (data: { build: BuildFormData }) => void
  selectedTemplateName?: string
  selectedTemplateRequirements?: {
    tee: 'tdx' | 'sgx' | undefined
    cpus: number | undefined
    memory: number | undefined
    storage: number | undefined
  }
}

export const BuildStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  build,
  setAppDataForm,
  selectedTemplateName,
  selectedTemplateRequirements,
}) => {
  const onSubmit = (values: BuildFormData) => {
    setAppDataForm({ build: values })
    handleNext()
  }

  return (
    <CreateLayout currentStep={3} selectedTemplateName={selectedTemplateName}>
      <CreateFormHeader title="Configure machine" description="" />

      <BuildForm
        onSubmit={onSubmit}
        build={build}
        selectedTemplateRequirements={selectedTemplateRequirements}
      >
        {({ form, handleFormSubmit, noOffersWarning }) => (
          <CreateFormNavigation
            handleNext={handleFormSubmit}
            handleBack={handleBack}
            disabled={form.formState.isSubmitting || noOffersWarning}
          />
        )}
      </BuildForm>
    </CreateLayout>
  )
}
