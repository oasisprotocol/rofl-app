import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { InputFormField } from '../InputFormField'
import { Plus } from 'lucide-react'
import { Control, FieldValues, Path } from 'react-hook-form'

type AddSecretFormContentProps<T extends FieldValues> = {
  formControl: Control<T>
  disabled?: boolean
  onClick?: () => void
}

export const AddSecretFormContent = <T extends FieldValues>({
  formControl,
  disabled,
  onClick,
}: AddSecretFormContentProps<T>) => {
  return (
    <div className="flex gap-4 mt-4 w-full">
      <div className="w-1/2">
        <InputFormField
          control={formControl}
          name={'name' as Path<T>}
          placeholder="Type Name"
          disabled={disabled}
        />
      </div>
      <div className="w-1/2">
        <InputFormField
          control={formControl}
          name={'value' as Path<T>}
          placeholder="Type Value"
          type="password"
          disabled={disabled}
        />
      </div>
      <Button
        variant="secondary"
        size="icon"
        type={onClick ? 'button' : 'submit'}
        disabled={disabled}
        onClick={onClick}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
