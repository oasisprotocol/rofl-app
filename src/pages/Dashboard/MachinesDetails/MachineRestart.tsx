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
import { RotateCcw } from 'lucide-react'

type MachineRestartProps = {
  onConfirm: () => void
  disabled?: boolean
}

export const MachineRestart: FC<MachineRestartProps> = ({ onConfirm, disabled }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto md:ml-8" disabled={disabled}>
          <RotateCcw />
          Restart
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Restart machine</DialogTitle>
          <DialogDescription>
            The machine and your app will be unavailable during the restart process.
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
