import { type FC } from 'react';
import { type Control } from 'react-hook-form';
import { InputFormField } from '../../pages/CreateApp/InputFormField';
import { type MetadataFormData } from '../../pages/CreateApp/types';

type MetadataFormFieldsProps = {
  control: Control<MetadataFormData>;
};

export const MetadataFormFields: FC<MetadataFormFieldsProps> = ({
  control,
}) => {
  return (
    <div className="space-y-6">
      <InputFormField
        control={control}
        name="name"
        label="Name"
        placeholder="ROFL App name"
      />

      <InputFormField
        control={control}
        name="author"
        label="Author"
        placeholder="Rofl App Creator"
      />

      <InputFormField
        control={control}
        name="description"
        label="Description"
        placeholder="Tell us something about it"
        type="textarea"
      />

      <InputFormField
        control={control}
        name="version"
        label="Version"
        placeholder="Rofl App version"
      />

      <InputFormField
        control={control}
        name="license"
        label="license"
        placeholder="MIT, Apache-2.0, etc."
      />

      <InputFormField
        control={control}
        name="homepage"
        label="Homepage"
        placeholder="Website, Twitter, Discord"
      />
    </div>
  );
};
