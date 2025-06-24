import { type ReactNode } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Input } from '@oasisprotocol/ui-library/src/components/ui/input';
import { Textarea } from '@oasisprotocol/ui-library/src/components/ui/textarea';
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label';

type InputFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'input' | 'password' | 'number' | 'textarea';
  disabled?: boolean;
};

export const InputFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'input',
  disabled = false,
}: InputFormFieldProps<T>): ReactNode => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            {type === 'input' || type === 'password' || type === 'number' ? (
              <Input
                className="dark:[-webkit-autofill]:!bg-gray-800 dark:[-webkit-autofill]:!text-white"
                id={name}
                placeholder={placeholder}
                {...field}
                aria-invalid={!!fieldState.error}
                type={type}
                autoComplete={type === 'password' ? 'new-password' : 'off'}
                spellCheck={type === 'password' ? 'false' : 'true'}
                disabled={disabled}
              />
            ) : (
              <Textarea
                id={name}
                placeholder={placeholder}
                {...field}
                aria-invalid={!!fieldState.error}
              />
            )}
            {fieldState.error && (
              <div className="text-destructive text-sm">
                {fieldState.error.message}
              </div>
            )}
          </>
        )}
      />
    </div>
  );
};
