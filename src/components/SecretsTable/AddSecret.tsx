import { type FC } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InputFormField } from '../InputFormField'
import { Plus } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  value: z.string().min(1, {
    message: 'Secret is required.',
  }),
})

type AddSecretProps = {
  handleAddSecret?: (name: string, value: string) => void
  disabled?: boolean
}

export const AddSecret: FC<AddSecretProps> = ({ handleAddSecret, disabled }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      value: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleAddSecret?.(values.name, values.value)
    form.reset()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 ">
      <div className="w-1/2">
        <InputFormField control={form.control} name="name" placeholder="Type Name" disabled={disabled} />
      </div>
      <div className="w-1/2">
        <InputFormField
          control={form.control}
          name="value"
          placeholder="Type Value"
          type="password"
          disabled={disabled}
        />
      </div>
      <Button variant="secondary" size="icon" type="submit" disabled={disabled}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}
