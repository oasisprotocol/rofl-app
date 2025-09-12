import { type FC, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateFormNavigation } from './CreateFormNavigation'
import { customBuildFormSchema, type CustomBuildFormData } from './types'
import { SecretsTable } from '../../components/SecretsTable'
import { CodeDisplay } from '../../components/CodeDisplay'
import { type RoflAppSecrets } from '../../nexus/api'
import { AddSecretFormContent } from '../../components/SecretsTable/AddSecretFormContent'
import { useComposeValidation } from './useComposeValidation'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { composePlaceholder } from './composePlaceholder'

type CustomBuildSetupFormProps = {
  handleNext: () => void
  handleBack: () => void
  inputs?: CustomBuildFormData
  setAppDataForm: (data: { inputs: CustomBuildFormData }) => void
}

export const CustomBuildSetupForm: FC<CustomBuildSetupFormProps> = ({
  handleNext,
  handleBack,
  inputs,
  setAppDataForm,
}) => {
  const { isValidating, validationError, validateCompose, clearValidation } = useComposeValidation()
  const [passwordFieldResetKey, setPasswordFieldResetKey] = useState(0)
  const form = useForm({
    resolver: zodResolver(customBuildFormSchema),
    defaultValues: {
      compose: inputs?.compose || '',
      secrets: inputs?.secrets || {},
      name: '',
      value: '',
    } as CustomBuildFormData,
  })

  async function onSubmit(values: CustomBuildFormData) {
    const { compose, secrets, name, value } = values

    // Make sure secret inputs are empty before continuing
    if (name && name.trim() !== '') {
      form.setError('name', {
        type: 'manual',
        message: 'Please add or clear the secret before continuing.',
      })
      return
    }

    if (value && value.trim() !== '') {
      form.setError('value', {
        type: 'manual',
        message: 'Please add or clear the secret before continuing.',
      })
      return
    }

    const isValid = await validateCompose(compose)

    if (isValid) {
      setAppDataForm({ inputs: { compose, secrets } as CustomBuildFormData })
      handleNext()
    }
  }

  const navigateBack = () => {
    setAppDataForm({ inputs: { compose, secrets } as CustomBuildFormData })
    handleBack()
  }

  const handleComposeChange = (newContent: string | undefined) => {
    const content = newContent || ''
    form.setValue('compose', content)
    clearValidation()
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
      // Used to remount password field component and reset its state.
      // In case of password visibility enabled we want to make sure next new secret is hidden again
      setPasswordFieldResetKey(prev => prev + 1)
    }
  }

  const compose = form.watch('compose')
  const secrets = form.watch('secrets')

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-6 w-full">
      <div>
        <div className="self-stretch px-4 py-2 bg-white/10 rounded-tl-lg rounded-tr-lg inline-flex justify-between items-center m-0 w-full">
          <div className="justify-start text-base-foreground text-base font-medium leading-normal">
            compose.yaml
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <CodeDisplay
              className="h-[1300px]"
              data={compose}
              readOnly={false}
              onChange={handleComposeChange}
              placeholder={composePlaceholder}
            />
          </div>
          {form.formState.errors.compose && (
            <div className="text-destructive text-sm">{form.formState.errors.compose.message}</div>
          )}
          {validationError && (
            <div className="[&::first-letter]:uppercase text-destructive text-sm whitespace-pre-wrap">
              {validationError}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="justify-start text-base-foreground text-xl font-semibold leading-7 mb-4">Secrets</div>
        <div>
          <SecretsTable
            secrets={secrets as RoflAppSecrets}
            editEnabled
            setViewSecretsState={handleSecretsChange}
          />
          <AddSecretFormContent
            formControl={form.control}
            onClick={handleAddSecret}
            resetKey={passwordFieldResetKey}
            className={cn({
              'mt-0': secrets && Object.keys(secrets).length === 0,
            })}
          />
        </div>
      </div>

      <CreateFormNavigation
        handleBack={navigateBack}
        disabled={form.formState.isSubmitting || isValidating}
        isLoading={isValidating}
      />
    </form>
  )
}
