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

type EditSecretDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  secret?: string
  handleEditSecret?: (name: string, value: string) => void
  editEnabled?: boolean
}

export const EditSecretDialog: FC<EditSecretDialogProps> = ({
  open,
  onOpenChange,
  secret,
  handleEditSecret,
}) => {
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
      form.reset({
        name: secret,
        value: '',
      })
    }
  }, [open, secret, form])

  function handleDialogOpenChange(newOpen: boolean) {
    if (!newOpen) {
      onCancel()
    }
    onOpenChange(newOpen)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleEditSecret?.(secret!, values.value)

    form.reset()
    onOpenChange(false)
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit(onSubmit)(e)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit secret</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-6">Please provide a new secret value.</DialogDescription>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <InputFormField control={form.control} name="name" label="Name" disabled />

          <InputFormField control={form.control} name="value" label="Value" type="password" />

          <DialogFooter>
            <div className="flex flex-1 justify-between">
              <Button variant="outline" onClick={onCancel} type="reset">
                Cancel
              </Button>
              <Button type="submit">Replace</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
