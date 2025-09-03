import { type FC } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AddSecretFormContent } from './AddSecretFormContent'

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
      <AddSecretFormContent formControl={form.control} disabled={disabled} />
    </form>
  )
}
