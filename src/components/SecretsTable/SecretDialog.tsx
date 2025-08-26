import { type FC, useEffect } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@oasisprotocol/ui-library/src/components/ui/dialog'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InputFormField } from '../InputFormField'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  value: z.string().min(1, {
    message: 'Secret is required.',
  }),
})

type SecretDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  secret?: string
  handleAddSecret?: (name: string, value: string) => void
  handleEditSecret?: (name: string, value: string) => void
  editEnabled?: boolean
}

export const SecretDialog: FC<SecretDialogProps> = ({
  open,
  onOpenChange,
  mode,
  secret,
  handleAddSecret,
  handleEditSecret,
}) => {
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
    onOpenChange(false)
  }

  useEffect(() => {
    if (open) {
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
    }
  }, [open, isEditMode, secret, form])

  function handleDialogOpenChange(newOpen: boolean) {
    if (!newOpen) {
      onCancel()
    }
    onOpenChange(newOpen)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (mode === 'add') {
      handleAddSecret?.(values.name, values.value)
    }

    if (isEditMode && secret) {
      handleEditSecret?.(secret, values.value)
    }

    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit secret' : 'Add new secret'}</DialogTitle>
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
