import { type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputFormField } from './InputFormField';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  author: z.string().min(1, {
    message: 'Author is required.',
  }),
  description: z.string().min(1, {
    message: 'Description is required.',
  }),
  version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      {
        message: 'Version must be valid semver format (e.g., 1.0.0).',
      }
    ),
  homepage: z.string().min(1, {
    message: 'Homepage is required.',
  }),
});

type MetadataStepProps = {
  handleNext: () => void;
};

export const MetadataStep: FC<MetadataStepProps> = ({ handleNext }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      author: '',
      description: '',
      version: '0.1.0',
      homepage: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Metadata values:', values);
    handleNext();
  };

  const formHasErrors = !form.formState.isValid;

  return (
    <CreateLayout
      currentStep={1}
      hints={[
        {
          title: 'Tips and Tricks',
          description:
            'Ultricies convallis urna habitant blandit risus ultrices facilisi donec. Bibendum semper convallis sit tellus tincidunt tincidunt.',
        },
      ]}
    >
      <CreateFormHeader
        title="Input Your Public ROFL Metadata"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet
          vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 mb-6 w-full"
      >
        <InputFormField
          control={form.control}
          name="name"
          label="Name"
          placeholder="ROFL App name"
        />

        <InputFormField
          control={form.control}
          name="author"
          label="Author"
          placeholder="Rofl App Creator"
        />

        <InputFormField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Tell us something about it"
          type="textarea"
        />

        <InputFormField control={form.control} name="version" label="Version" />

        <InputFormField
          control={form.control}
          name="homepage"
          label="Homepage"
          placeholder="Website, Twitter, Discord"
        />

        <CreateFormNavigation
          handleNext={form.handleSubmit(onSubmit)}
          disabled={formHasErrors || !form.formState.isDirty}
        />
      </form>
    </CreateLayout>
  );
};
