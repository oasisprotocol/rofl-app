import { type FC, useEffect } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { MetadataFormFields } from '../../components/MetadataFormFields'
import { metadataFormSchema, type MetadataFormData } from './types'

type MetadataStepProps = {
  handleNext: () => void
  setAppDataForm: (data: { metadata: MetadataFormData }) => void
  metadata?: MetadataFormData
  selectedTemplateName?: string
  selectedTemplateId?: string
}

export const MetadataStep: FC<MetadataStepProps> = ({
  handleNext,
  setAppDataForm,
  metadata,
  selectedTemplateName,
  selectedTemplateId,
}) => {
  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: { ...metadata },
  })

  useEffect(() => {
    form.reset({ ...metadata })
  }, [metadata, form])

  const onSubmit = (values: MetadataFormData) => {
    setAppDataForm({ metadata: values })
    handleNext()
  }

  return (
    <CreateLayout
      currentStep={1}
      selectedTemplateName={selectedTemplateName}
      selectedTemplateId={selectedTemplateId}
    >
      <CreateFormHeader
        title="Input Metadata"
        description="All data you provide here will be visible publicly on-chain."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
        <MetadataFormFields control={form.control} />

        <CreateFormNavigation disabled={form.formState.isSubmitting} />
      </form>
    </CreateLayout>
  )
}
