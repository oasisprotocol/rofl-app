import { type FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InputFormField } from './InputFormField'
import { SelectFormField } from './SelectFormField'
import { CreateFormNavigation } from './CreateFormNavigation'
import { tgbotFormSchema, type AgentFormData } from './types'

type TgbotAgentFormProps = {
  handleNext: () => void
  handleBack: () => void
  agent?: AgentFormData
  setAppDataForm: (data: { agent: AgentFormData }) => void
}

export const TgbotAgentForm: FC<TgbotAgentFormProps> = ({
  handleNext,
  handleBack,
  agent,
  setAppDataForm,
}) => {
  const form = useForm<AgentFormData>({
    resolver: zodResolver(tgbotFormSchema),
    defaultValues: { ...agent },
  })

  function onSubmit(values: AgentFormData) {
    setAppDataForm({ agent: values })
    handleNext()
  }

  const handleFormSubmit = () => {
    form.trigger().then(isValid => {
      if (isValid) {
        form.handleSubmit(onSubmit)()
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <SelectFormField
        control={form.control}
        name="OLLAMA_MODEL"
        label="Select the LLM running inside your TEE bot"
        placeholder="Select a model"
        options={[
          { value: 'gemma3:1b', label: 'Gemma 3 1B' },
          { value: 'deepseek-r1:1.5b', label: 'Deepseek 1.5B' },
        ]}
      />

      <InputFormField
        control={form.control}
        name="TOKEN"
        label="Telegram API token"
        placeholder="Paste or type API token here"
        type="password"
      />

      <InputFormField
        control={form.control}
        name="OLLAMA_SYSTEM_PROMPT"
        label="LLM system prompt"
        placeholder="Instructions for the agent on how to act, behave..."
        type="textarea"
      />

      <CreateFormNavigation
        handleNext={handleFormSubmit}
        handleBack={handleBack}
        disabled={form.formState.isSubmitting}
      />
    </form>
  )
}
