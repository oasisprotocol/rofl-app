import { type FC } from 'react'
import { type Control } from 'react-hook-form'
import { type MetadataFormData } from '../../pages/CreateApp/types'
import { InputFormField } from '../InputFormField'

type MetadataFormFieldsProps = {
  control: Control<MetadataFormData>
}

export const MetadataFormFields: FC<MetadataFormFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      <InputFormField control={control} name="name" label="Name" placeholder="App name" />

      <InputFormField control={control} name="author" label="Author" placeholder="John Doe" />

      <InputFormField
        control={control}
        name="description"
        label="Description"
        placeholder="Tell us something about it"
        type="textarea"
      />

      <InputFormField control={control} name="version" label="Version" placeholder="App version" />

      <InputFormField
        control={control}
        name="homepage"
        label="Homepage"
        placeholder="Website, Twitter, Discord"
      />
    </div>
  )
}
