import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { BuildForm } from '../../components/BuildForm'
import { BuildFormData } from '../../types/build-form.ts'

type BuildStepProps = {
  handleNext: () => void
  handleBack: () => void
  build?: BuildFormData
  setAppDataForm: (data: { build: BuildFormData }) => void
  selectedTemplateName?: string
  selectedTemplateId?: string
  selectedTemplateRequirements?: {
    tee: 'tdx' | 'sgx' | undefined
    cpus: number | undefined
    memory: number | undefined
    storage: number | undefined
  }
}

export const BuildStep: FC<BuildStepProps> = ({
  handleNext,
  handleBack,
  build,
  setAppDataForm,
  selectedTemplateName,
  selectedTemplateId,
  selectedTemplateRequirements,
}) => {
  const onSubmit = (values: BuildFormData) => {
    setAppDataForm({ build: values })
    handleNext()
  }

  return (
    <CreateLayout
      currentStep={3}
      selectedTemplateName={selectedTemplateName}
      selectedTemplateId={selectedTemplateId}
    >
      <CreateFormHeader title="Configure machine" />

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
