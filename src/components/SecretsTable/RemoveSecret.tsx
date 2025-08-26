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

type RemoveSecretProps = {
  secret: string
  handleRemoveSecret: (secret: string) => void
  open: boolean
}

export const RemoveSecret: FC<RemoveSecretProps> = ({ secret, handleRemoveSecret, open }) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      {/* <DialogTrigger asChild>
        <Button disabled={!editEnabled} variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 />
        </Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Please confirm your action</DialogTitle>
          <DialogDescription>
            Secret key <strong>{secret}</strong> will be removed from the app.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={() => handleRemoveSecret(secret)}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
