import { type FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateFormNavigation } from './CreateFormNavigation'
import { customBuildFormSchema, type CustomBuildFormData } from './types'
import { SecretsTable } from '../../components/SecretsTable'
import { CodeDisplay } from '../../components/CodeDisplay'
import customBuildCompose from '../../../templates/custom-build/compose.yaml?raw'
import { type RoflAppSecrets } from '../../nexus/api'
import { AddSecretFormContent } from '../../components/SecretsTable/AddSecretFormContent'

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
      secrets: agent?.secrets || {},
      name: '',
      value: '',
    } as CustomBuildFormData,
  })

  function onSubmit(values: CustomBuildFormData) {
    const { compose, secrets } = values
    setAppDataForm({ agent: { compose, secrets } as CustomBuildFormData })
    handleNext()
  }

  const handleComposeChange = (newContent: string | undefined) => {
    const content = newContent || '\n'
    form.setValue('compose', content)
  }

  const handleSecretsChange = (state: { isDirty: boolean; secrets: Record<string, string> }) => {
    form.setValue('secrets', state.secrets)
  }

  const handleAddSecret = () => {
    const name = form.getValues('name')
    const value = form.getValues('value')

    // Manual validation for adding new secrets. These fields cannot be part of a main form validation
    let hasError = false

    if (!name || name.trim() === '') {
      form.setError('name', { type: 'manual', message: 'Name is required.' })
      hasError = true
    }

    if (!value || value.trim() === '') {
      form.setError('value', { type: 'manual', message: 'Secret is required.' })
      hasError = true
    }

    if (!hasError && name && value) {
      const currentSecrets = form.getValues('secrets') || {}
      const updatedSecrets = {
        ...currentSecrets,
        [name]: value,
      }
      form.setValue('secrets', updatedSecrets)
      form.setValue('name', '')
      form.setValue('value', '')
      form.clearErrors(['name', 'value'])
    }
  }

  const compose = form.watch('compose')
  const secrets = form.watch('secrets')

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-6 w-full">
      <div>
        <div className="justify-start text-base-foreground text-xl font-semibold leading-7 mb-4">Compose</div>
        <div className="self-stretch px-4 py-2 bg-white/10 rounded-tl-lg rounded-tr-lg inline-flex justify-between items-center m-0 w-full">
          <div className="justify-start text-base-foreground text-base font-medium leading-normal">
            compose.yaml
          </div>
        </div>
        <CodeDisplay className="h-[450px]" data={compose} readOnly={false} onChange={handleComposeChange} />
      </div>

      <div>
        <div className="justify-start text-base-foreground text-xl font-semibold leading-7 mb-4">Secrets</div>
        <div>
          <SecretsTable
            secrets={secrets as RoflAppSecrets}
            editEnabled
            setViewSecretsState={handleSecretsChange}
          />
          <AddSecretFormContent formControl={form.control} onClick={handleAddSecret} />
        </div>
      </div>

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
