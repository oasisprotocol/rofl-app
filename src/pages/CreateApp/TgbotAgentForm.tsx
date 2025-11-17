import { type FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SelectFormField } from '../../components/SelectFormField'
import { CreateFormNavigation } from './CreateFormNavigation'
import { tgbotFormSchema, type AgentFormData } from './types'
import { InputFormField } from '../../components/InputFormField'

type TgbotAgentFormProps = {
  handleNext: () => void
  handleBack: () => void
  inputs?: AgentFormData
  setAppDataForm: (data: { inputs: AgentFormData }) => void
}

export const TgbotAgentForm: FC<TgbotAgentFormProps> = ({
  handleNext,
  handleBack,
  inputs,
  setAppDataForm,
}) => {
  const form = useForm<AgentFormData>({
    resolver: zodResolver(tgbotFormSchema),
    defaultValues: { ...inputs },
  })

  function onSubmit(values: AgentFormData) {
    setAppDataForm({ inputs: values })
    handleNext()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <SelectFormField
        control={form.control}
        name="secrets.OLLAMA_MODEL"
        label="LLM running inside your TEE bot"
        placeholder="Select a model"
        options={[
          { value: 'gemma3:1b', label: 'Gemma 3 1B' },
          { value: 'deepseek-r1:1.5b', label: 'Deepseek 1.5B' },
        ]}
      />

      <InputFormField
        control={form.control}
        name="secrets.TOKEN"
        label="Telegram API token"
        placeholder="Paste or type API token here"
        type="password"
      />

      <InputFormField
        control={form.control}
        name="secrets.OLLAMA_SYSTEM_PROMPT"
        label="LLM system prompt"
        placeholder="Instructions for the agent on how to act, behave..."
        type="textarea"
      />

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
