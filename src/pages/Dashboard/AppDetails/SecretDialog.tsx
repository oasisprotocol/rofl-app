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
import { CirclePlus, SquarePen } from 'lucide-react';
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

type SecretDialogProps = {
  mode: 'add' | 'edit';
  secret?: string;
};

export const SecretDialog: FC<SecretDialogProps> = ({ mode, secret }) => {
  const [open, setOpen] = useState(false);
  const isEditMode = mode === 'edit';

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
      if (isEditMode && secret) {
        form.reset({
          name: secret,
          value: '',
        });
      } else {
        form.reset({
          name: '',
          value: '',
        });
      }
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
        {isEditMode ? (
          <Button variant="ghost">
            <SquarePen />
          </Button>
        ) : (
          <Button variant="ghost" className="text-primary">
            <CirclePlus />
            Add new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Secret' : 'Add New Secret'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-6">
          {isEditMode
            ? 'Please provide a new secret value.'
            : 'Please provide a name and secret for the new entry.'}
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="name"
                    placeholder={isEditMode ? '' : 'Enter secret name'}
                    {...field}
                    disabled={isEditMode}
                    aria-invalid={!isEditMode && !!fieldState.error}
                  />
                  {!isEditMode && fieldState.error && (
                    <div className="text-destructive text-sm">
                      {fieldState.error.message}
                    </div>
                  )}
                </>
              )}
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
                {isEditMode ? 'Replace' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
