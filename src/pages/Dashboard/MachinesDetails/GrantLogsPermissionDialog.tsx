import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/dialog'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InputFormField } from '../../../components/InputFormField'
import { FileText } from 'lucide-react'

const formSchema = z.object({
  evmAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Please enter a valid Sapphire address (0x followed by 40 hex characters)',
  }),
})

type GrantLogsPermissionDialogProps = {
  onConfirm: (evmAddress: `0x${string}`) => void
  disabled?: boolean
}

export const GrantLogsPermissionDialog: FC<GrantLogsPermissionDialogProps> = ({ onConfirm, disabled }) => {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evmAddress: '0x',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        evmAddress: '0x',
      })
    }
  }, [open, form])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onConfirm(values.evmAddress as `0x${string}`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto" disabled={disabled}>
          <FileText />
          Grant logs permission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grant logs view permission</DialogTitle>
          <DialogDescription>
            Enter an address to grant logs view permission. The machine will restart after granting
            permission.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 py-4">
            <InputFormField control={form.control} name="evmAddress" label="Address" placeholder="0x..." />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              Grant permission and restart
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
