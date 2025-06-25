import { useState, type FC } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/dialog'
import { CirclePlus, SquarePen } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InputFormField } from '../../CreateApp/InputFormField'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  value: z.string().min(1, {
    message: 'Secret is required.',
  }),
})

type SecretDialogProps = {
  mode: 'add' | 'edit'
  secret?: string
  handleAddSecret?: (name: string, value: string) => void
  handleEditSecret?: (name: string, value: string) => void
  editEnabled?: boolean
}

export const SecretDialog: FC<SecretDialogProps> = ({
  mode,
  secret,
  handleAddSecret,
  handleEditSecret,
  editEnabled,
}) => {
  const [open, setOpen] = useState(false)
  const isEditMode = mode === 'edit'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      value: '',
    },
  })

  function onCancel() {
    form.reset()
    setOpen(false)
  }

  function onOpenChange(newOpen: boolean) {
    if (!newOpen) {
      onCancel()
    } else {
      if (isEditMode && secret) {
        form.reset({
          name: secret,
          value: '',
        })
      } else {
        form.reset({
          name: '',
          value: '',
        })
      }
      setOpen(newOpen)
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (mode === 'add') {
      handleAddSecret?.(values.name, values.value)
    }

    if (isEditMode && secret) {
      handleEditSecret?.(secret, values.value)
    }

    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button variant="ghost">
            <SquarePen />
          </Button>
        ) : (
          <Button variant="ghost" className="text-primary" disabled={!editEnabled}>
            <CirclePlus />
            Add new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Secret' : 'Add New Secret'}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-6">
          {isEditMode
            ? 'Please provide a new secret value.'
            : 'Please provide a name and secret for the new entry.'}
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <InputFormField
            control={form.control}
            name="name"
            label="Name"
            placeholder={isEditMode ? '' : 'Enter secret name'}
            disabled={isEditMode}
          />

          <InputFormField control={form.control} name="value" label="Value" type="password" />

          <DialogFooter>
            <div className="flex flex-1 justify-between">
              <Button variant="outline" onClick={onCancel} type="reset">
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? 'Replace' : 'Save Changes'}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
