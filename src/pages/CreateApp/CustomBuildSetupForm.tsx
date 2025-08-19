import { type FC, useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as yaml from 'yaml'
import { CreateFormNavigation } from './CreateFormNavigation'
import { customBuildFormSchema, type CustomBuildFormData } from './types'
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
  const form = useForm({
    resolver: zodResolver(customBuildFormSchema),
    defaultValues: {
      compose: agent?.compose || customBuildCompose,
      secrets: agent?.secrets || [],
    } as CustomBuildFormData,
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
    try {
      if (content) {
        yaml.parse(content)
      }
    } catch (error) {
      console.log('Invalid YAML syntax:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-6 w-full">
      <div>
        <div className="justify-start text-base-foreground text-xl font-semibold leading-7 mb-4">Compose</div>
        <div className="self-stretch px-4 py-2 bg-white/10 rounded-tl-lg rounded-tr-lg inline-flex justify-between items-center m-0 w-full">
          <div className="justify-start text-base-foreground text-base font-medium leading-normal">
            compose.yaml
          </div>
        </div>
        <CodeDisplay data={customBuildCompose} readOnly={false} onChange={handleComposeChange} />
      </div>

      <div>
        <div className="justify-start text-base-foreground text-xl font-semibold leading-7 mb-4">Secrets</div>
        <div>TBA</div>
      </div>

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
