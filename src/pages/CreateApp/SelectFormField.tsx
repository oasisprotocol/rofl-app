import { type ReactNode } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@oasisprotocol/ui-library/src/components/ui/select';
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label';

type SelectOption = {
  value: string;
  label: string;
};

type SelectFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
};

export const SelectFormField = <T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
}: SelectFormFieldProps<T>): ReactNode => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger
                id={name}
                aria-invalid={!!fieldState.error}
                className="w-full"
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
