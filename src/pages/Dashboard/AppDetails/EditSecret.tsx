import { useState, type FC } from 'react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/dialog';
import { SquarePen } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@oasisprotocol/ui-library/src/components/ui/input';
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label';

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  value: z.string().min(1, {
    message: 'Secret is required.',
  }),
});

type EditSecretProps = {
  secret?: string;
};

export const EditSecret: FC<EditSecretProps> = ({ secret }) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      value: '',
    },
  });

  function onCancel() {
    form.reset();
    setOpen(false);
  }

  function onOpenChange(newOpen: boolean) {
    if (!newOpen) {
      onCancel();
    } else {
      form.reset({
        name: secret,
        value: '',
      });
      setOpen(newOpen);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('values', values);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <SquarePen />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Secret</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-6">
          Please provide a new secret value.
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => <Input id="name" {...field} disabled />}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">Value</Label>
            <Controller
              control={form.control}
              name="value"
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="value"
                    type="password"
                    {...field}
                    aria-invalid={!!fieldState.error}
                  />
                  {fieldState.error && (
                    <p className="text-destructive text-sm">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <DialogFooter>
            <div className="flex flex-1 justify-between">
              <Button variant="outline" onClick={onCancel} type="reset">
                Cancel
              </Button>
              <Button type="submit" className="">
                Replace
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
