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
import { CircleStop } from 'lucide-react'

type MachineStopProps = {
  onConfirm?: () => void
  disabled?: boolean
}

export const MachineStop: FC<MachineStopProps> = ({ onConfirm, disabled }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto md:mr-8" disabled={disabled}>
          <CircleStop />
          Stop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stop Machine</DialogTitle>
          <DialogDescription>
            This action will stop the machine and your app will not longer use this provider.
          </DialogDescription>
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
