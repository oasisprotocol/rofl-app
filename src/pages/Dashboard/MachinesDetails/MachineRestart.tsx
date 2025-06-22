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
import { RotateCcw } from 'lucide-react';

export const MachineRestart: FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto md:ml-8">
          <RotateCcw />
          Restart
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Please confirm your action</DialogTitle>
          <DialogDescription>
            This action will restart the machine and your app will not be
            available during this process.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => console.log('trigger stop action')}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
