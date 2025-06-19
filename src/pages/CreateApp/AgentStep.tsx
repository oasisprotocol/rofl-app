import { type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputFormField } from './InputFormField';
import { SelectFormField } from './SelectFormField';
import { agentFormSchema, type AgentFormData } from './types';

type AgentStepProps = {
  handleNext: () => void;
  handleBack: () => void;
  agent?: AgentFormData;
  setAppDataForm: (data: { agent: AgentFormData }) => void;
  selectedTemplateName?: string;
};

export const AgentStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  agent,
  setAppDataForm,
  selectedTemplateName,
}) => {
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: { ...agent },
  });

  function onSubmit(values: AgentFormData) {
    setAppDataForm({ agent: values });
    handleNext();
  }

  const handleFormSubmit = () => {
    form.trigger().then((isValid) => {
      if (isValid) {
        form.handleSubmit(onSubmit)();
      }
    });
  };

  return (
    <CreateLayout
      currentStep={2}
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
        title="Agent Specific Stuff"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 mb-6 w-full"
      >
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
    </CreateLayout>
  );
};
