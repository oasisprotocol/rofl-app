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
import { Trash2 } from 'lucide-react'
import { useTicker } from '../../../hooks/useTicker'
import { fromBaseUnits } from '../../../utils/number-utils'

type RemoveAppButtonProps = {
  onConfirm: () => void
  stakedAmount: string
}

export const RemoveAppButton: FC<RemoveAppButtonProps> = ({ stakedAmount, onConfirm }) => {
  const ticker = useTicker()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Restart Machine</DialogTitle>
          <DialogDescription>
            This will permanently remove the app and get back {fromBaseUnits(stakedAmount)} {ticker}. This
            action cannot be undone.
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
