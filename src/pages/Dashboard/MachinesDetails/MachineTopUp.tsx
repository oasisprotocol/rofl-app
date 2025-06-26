import { type FC } from 'react'
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
import { CircleArrowUp } from 'lucide-react'

type MachineTopUpProps = {
  onConfirm: () => void
  disabled?: boolean
}

export const MachineTopUp: FC<MachineTopUpProps> = ({ onConfirm, disabled }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto" disabled={disabled}>
          <CircleArrowUp />
          Top up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Top up machine</DialogTitle>
          <DialogDescription>At varius sit sit netus at integer vitae posuere id.</DialogDescription>
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
