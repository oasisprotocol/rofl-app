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
    <CreateLayout
      currentStep={3}
      hints={[
        {
          title: 'Tips and Tricks',
          description:
            'Ultricies convallis urna habitant blandit risus ultrices facilisi donec. Bibendum semper convallis sit tellus tincidunt tincidunt.',
        },
      ]}
      selectedTemplateName={selectedTemplateName}
    >
      <CreateFormHeader
        title="Build and Deploy"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />

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
