import { type FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SelectFormField } from '../../components/SelectFormField'
import { CreateFormNavigation } from './CreateFormNavigation'
import { xAgentFormSchema, type XAgentFormData } from './types'
import { InputFormField } from '../../components/InputFormField'

type XAgentFormProps = {
  handleNext: () => void
  handleBack: () => void
  inputs?: XAgentFormData
  setAppDataForm: (data: { inputs: XAgentFormData }) => void
}

export const XAgentForm: FC<XAgentFormProps> = ({ handleNext, handleBack, inputs, setAppDataForm }) => {
  const form = useForm<XAgentFormData>({
    resolver: zodResolver(xAgentFormSchema),
    defaultValues: {
      secrets: {
        SYSTEM_PROMPT: '',
        TWITTER_BEARER_TOKEN: '',
        TWITTER_API_KEY: '',
        TWITTER_API_SECRET: '',
        TWITTER_ACCESS_TOKEN: '',
        TWITTER_ACCESS_TOKEN_SECRET: '',
        OPENAI_API_KEY: '',
        OPENAI_MODEL: '',
      },
      ...inputs,
    },
  })

  function onSubmit(values: XAgentFormData) {
    setAppDataForm({ inputs: values })
    handleNext()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
      <InputFormField
        control={form.control}
        name="secrets.SYSTEM_PROMPT"
        label="Bot Persona"
        placeholder="Define your bot's personality and behavior. This determines what kind of tweets it will generate..."
        type="textarea"
      />

      <InputFormField
        control={form.control}
        name="secrets.TWITTER_BEARER_TOKEN"
        label="Twitter Bearer Token"
        placeholder="Your Twitter Bearer token (from Twitter Developer Portal)"
        type="password"
      />

      <InputFormField
        control={form.control}
        name="secrets.TWITTER_API_KEY"
        label="Twitter API Key"
        placeholder="Your Twitter API key (from Twitter Developer Portal)"
        type="input"
      />

      <InputFormField
        control={form.control}
        name="secrets.TWITTER_API_SECRET"
        label="Twitter API Secret"
        placeholder="Your Twitter API secret (from Twitter Developer Portal)"
        type="password"
      />

      <InputFormField
        control={form.control}
        name="secrets.TWITTER_ACCESS_TOKEN"
        label="Twitter Access Token"
        placeholder="Your Twitter API access token (from Twitter Developer Portal)"
        type="input"
      />

      <InputFormField
        control={form.control}
        name="secrets.TWITTER_ACCESS_TOKEN_SECRET"
        label="Twitter Access Token Secret"
        placeholder="Your Twitter API access token secret (from Twitter Developer Portal)"
        type="password"
      />

      <InputFormField
        control={form.control}
        name="secrets.OPENAI_API_KEY"
        label="OpenAI API Key"
        placeholder="Your OpenAI API key for generating tweet content (sk-...)"
        type="password"
      />

      <SelectFormField
        control={form.control}
        name="secrets.OPENAI_MODEL"
        label="OpenAI Model"
        placeholder="Select the OpenAI model to use for generating tweets"
        options={[
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Cost-effective)' },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Balanced performance)' },
          { value: 'gpt-4o', label: 'GPT-4o (Most capable)' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (High quality)' },
          { value: 'gpt-4', label: 'GPT-4 (Legacy)' },
          { value: 'o1-mini', label: 'O1 Mini (Reasoning focused)' },
          { value: 'o1', label: 'O1 (Advanced reasoning)' },
        ]}
      />

      <CreateFormNavigation handleBack={handleBack} disabled={form.formState.isSubmitting} />
    </form>
  )
}
