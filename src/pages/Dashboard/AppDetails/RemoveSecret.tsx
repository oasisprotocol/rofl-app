import type { FC } from 'react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/dialog';
import { Trash2 } from 'lucide-react';

type RemoveSecretProps = {
  secret: string;
};

export const RemoveSecret: FC<RemoveSecretProps> = ({ secret }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Please confirm your action</DialogTitle>
          <DialogDescription>
            Secret key <strong>{secret}</strong> will be removed from ROFL app.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose>
            <Button
              variant="destructive"
              onClick={() => console.log('trigger stop action')}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
