import { type FC, useEffect } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { InputFormField } from './InputFormField';
import { SelectFormField } from './SelectFormField';

const formSchema = z.object({
  modelProvider: z.string().min(1, {
    message: 'Model provider is required.',
  }),
  model: z.string().min(1, {
    message: 'Model is required.',
  }),
  apiKey: z.string().min(1, {
    message: 'API key is required.',
  }),
  prompt: z.string().min(1, {
    message: 'Prompt is required.',
  }),
});

type AgentStepProps = {
  handleNext: () => void;
  handleBack: () => void;
};

export const AgentStep: FC<AgentStepProps> = ({ handleNext, handleBack }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelProvider: '',
      model: '',
      apiKey: '',
      prompt: '',
    },
  });

  const modelProvider = useWatch({
    control: form.control,
    name: 'modelProvider',
  });

  useEffect(() => {
    form.setValue('model', '');
  }, [modelProvider, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Agent values:', values);
    handleNext();
  }

  const handleFormSubmit = () => {
    form.trigger().then((isValid) => {
      if (isValid) {
        form.handleSubmit(onSubmit)();
      }
    });
  };

  const getModelOptions = () => {
    if (modelProvider === 'openai') {
      return [{ value: 'gpt-4o', label: 'ChatGPT 4o' }];
    } else if (modelProvider === 'anthropic') {
      return [{ value: 'sonnet-3.7', label: 'Sonnet-3.7' }];
    }
    return [];
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
          name="modelProvider"
          label="Model Provider"
          placeholder="Select a model provider"
          options={[
            { value: 'openai', label: 'OpenAI' },
            { value: 'anthropic', label: 'Anthropic' },
          ]}
        />

        <SelectFormField
          control={form.control}
          name="model"
          label="Select Model"
          placeholder="Select a model"
          options={getModelOptions()}
        />

        <InputFormField
          control={form.control}
          name="apiKey"
          label="Model Provider API Key"
          placeholder="Paste or type key here"
        />

        <InputFormField
          control={form.control}
          name="prompt"
          label="Prompt"
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
