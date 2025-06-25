import type { FC } from 'react'
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

type DiscardChangesProps = {
  disabled: boolean
  onConfirm: () => void
}

export const DiscardChanges: FC<DiscardChangesProps> = ({ disabled, onConfirm }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled} variant="destructive">
          Discard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Please confirm your action</DialogTitle>
          <DialogDescription>All temporary changes will be discarded.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
