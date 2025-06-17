import { type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputFormField } from './InputFormField';

const formSchema = z.object({
  artifacts: z.string().min(1, {
    message: 'Artifacts are required.',
  }),
  provider: z.string().min(1, {
    message: 'Provider is required.',
  }),
});

type AgentStepProps = {
  handleNext: () => void;
  handleBack: () => void;
};

export const BuildStep: FC<AgentStepProps> = ({ handleNext, handleBack }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      artifacts: 'oasis boot 0.5.0, ROFL container 0.5.1',
      provider: 'OPF',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Metadata values:', values);
    handleNext();
  };

  const formHasErrors = !form.formState.isValid;

  return (
    <CreateLayout
      currentStep={3}
      hints={[
        {
          title: 'Tips and Tricks',
          description:
            'Ultricies convallis urna habitant blandit risus ultrices facilisi donec. Bibendum semper convallis sit tellus tincidunt tincidunt.',
        },
      ]}
    >
      <CreateFormHeader
        title="Build and Deploy"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 mb-6 w-full"
      >
        <InputFormField
          control={form.control}
          name="artifacts"
          label="Base Artifacts"
          placeholder="oasis boot 0.5.0, ROFL container 0.5.1"
        />

        <InputFormField
          control={form.control}
          name="provider"
          label="Provider"
          placeholder="OPF"
        />

        <CreateFormNavigation
          handleNext={handleNext}
          handleBack={handleBack}
          disabled={formHasErrors}
        />
      </form>
    </CreateLayout>
  );
};
