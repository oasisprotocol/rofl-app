import { type ReactNode, useState } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Input } from '@oasisprotocol/ui-library/src/components/ui/input'
import { Textarea } from '@oasisprotocol/ui-library/src/components/ui/textarea'
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

type InputFormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  type?: 'input' | 'password' | 'number' | 'textarea'
  disabled?: boolean
  min?: number
}

export const InputFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'input',
  disabled = false,
  min,
}: InputFormFieldProps<T>): ReactNode => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password'
    }
    return type
  }

  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            {type === 'input' || type === 'password' || type === 'number' ? (
              <div className="relative">
                <Input
                  className="dark:[-webkit-autofill]:!bg-gray-800 dark:[-webkit-autofill]:!text-white"
                  id={name}
                  placeholder={placeholder}
                  {...field}
                  aria-invalid={!!fieldState.error}
                  type={getInputType()}
                  autoComplete="off"
                  spellCheck={type === 'password' ? 'false' : 'true'}
                  disabled={disabled}
                  min={min}
                />
                {type === 'password' && !disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide contents' : 'Show contents'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <Textarea id={name} placeholder={placeholder} {...field} aria-invalid={!!fieldState.error} />
            )}
            {fieldState.error && <div className="text-destructive text-sm">{fieldState.error.message}</div>}
          </>
        )}
      />
    </div>
  )
}
