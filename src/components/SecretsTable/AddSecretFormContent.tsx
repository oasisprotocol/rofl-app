import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { InputFormField } from '../InputFormField'
import { Plus } from 'lucide-react'
import { Control, FieldValues, Path } from 'react-hook-form'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'

type AddSecretFormContentProps<T extends FieldValues> = {
  formControl: Control<T>
  disabled?: boolean
  onClick?: () => void
  className?: string
  resetKey?: number
}

export const AddSecretFormContent = <T extends FieldValues>({
  className,
  formControl,
  disabled,
  onClick,
  resetKey,
}: AddSecretFormContentProps<T>) => {
  return (
    <div className={cn('flex gap-4 mt-4 w-full', className)}>
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
          key={resetKey}
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
