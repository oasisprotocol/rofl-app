import { type FC, useEffect } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { InputFormField } from './InputFormField';
import { metadataFormSchema, type MetadataFormData } from './types';

type MetadataStepProps = {
  handleNext: () => void;
  setAppDataForm: (data: { metadata: MetadataFormData }) => void;
  metadata?: MetadataFormData;
  selectedTemplateName?: string;
};

export const MetadataStep: FC<MetadataStepProps> = ({
  handleNext,
  setAppDataForm,
  metadata,
  selectedTemplateName,
}) => {
  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: { ...metadata },
  });

  useEffect(() => {
    form.reset({ ...metadata });
  }, [metadata, form]);

  const onSubmit = (values: MetadataFormData) => {
    setAppDataForm({ metadata: values });
    handleNext();
  };

  const handleFormSubmit = () => {
    form.trigger().then((isValid) => {
      if (isValid) {
        form.handleSubmit(onSubmit)();
      }
    });
  };

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
      selectedTemplateName={selectedTemplateName}
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

        <InputFormField
          control={form.control}
          name="version"
          label="Version"
          placeholder="Rofl App version"
        />

        <InputFormField
          control={form.control}
          name="homepage"
          label="Homepage"
          placeholder="Website, Twitter, Discord"
        />

        <CreateFormNavigation
          handleNext={handleFormSubmit}
          disabled={form.formState.isSubmitting}
        />
      </form>
    </CreateLayout>
  );
};
