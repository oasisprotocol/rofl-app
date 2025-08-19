import { type FC, useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateFormNavigation } from './CreateFormNavigation'
import { customBuildFormSchema, type CustomBuildFormData } from './types'
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import { CodeDisplay } from '../../components/CodeDisplay'
import customBuildCompose from '../../../templates/custom-build/compose.yaml?raw'

type CustomBuildSetupFormProps = {
  handleNext: () => void
  handleBack: () => void
  agent?: CustomBuildFormData
  setAppDataForm: (data: { agent: CustomBuildFormData }) => void
}

export const CustomBuildSetupForm: FC<CustomBuildSetupFormProps> = ({
  handleNext,
  handleBack,
  agent,
  setAppDataForm,
}) => {
  const form = useForm<CustomBuildFormData>({
    resolver: zodResolver(customBuildFormSchema),
    defaultValues: { ...agent },
  })

  const [composeContent, setComposeContent] = useState<string>(agent?.compose || customBuildCompose)

  useEffect(() => {
    form.setValue('compose', composeContent)
  }, [composeContent, form])
  function onSubmit(values: CustomBuildFormData) {
    setAppDataForm({ agent: values })
    handleNext()
  }

  const handleComposeChange = (newContent: string | undefined) => {
    const content = newContent || '\n'
    setComposeContent(content)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <div className="justify-start text-base-foreground text-xl font-semibold leading-7">Secrets</div>
      <div>TBA</div>
      <Separator />
      <div className="justify-start text-base-foreground text-xl font-semibold leading-7">Compose</div>
      <div className="self-stretch px-4 py-2 bg-white/10 rounded-tl-lg rounded-tr-lg inline-flex justify-between items-center m-0 w-full">
        <div className="justify-start text-base-foreground text-base font-medium leading-normal">
          compose.yaml
        </div>
      </div>
      <CodeDisplay data={customBuildCompose} readOnly={false} onChange={handleComposeChange} />
      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
