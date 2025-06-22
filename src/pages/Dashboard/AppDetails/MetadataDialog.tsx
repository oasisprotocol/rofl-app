import { useEffect, useState, type FC } from 'react';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MetadataFormFields } from '../../../components/MetadataFormFields';
import {
  metadataFormSchema,
  type MetadataFormData,
} from '../../CreateApp/types';
import type { RoflAppMetadata } from '../../../nexus/api';

type MetadataDialogProps = {
  metadata?: RoflAppMetadata;
};

export const MetadataDialog: FC<MetadataDialogProps> = ({ metadata }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataFormSchema),
    defaultValues: {
      name: '',
      author: '',
      description: '',
      version: '',
      homepage: '',
    },
  });

  useEffect(() => {
    if (metadata) {
      form.reset({
        name: (metadata?.['net.oasis.rofl.name'] as string) || '',
        author: (metadata?.['net.oasis.rofl.author'] as string) || '',
        description: (metadata?.['net.oasis.rofl.description'] as string) || '',
        version: (metadata?.['net.oasis.rofl.version'] as string) || '',
        homepage: (metadata?.['net.oasis.rofl.homepage'] as string) || '',
      });
    }
  }, [metadata, form]);

  function onCancel() {
    form.reset();
    setOpen(false);
  }

  function onOpenChange(newOpen: boolean) {
    if (!newOpen) {
      onCancel();
    } else {
      setOpen(newOpen);
    }
  }

  function onSubmit(values: MetadataFormData) {
    console.log(values);
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full md:w-auto md:ml-8 float-right"
        >
          <SquarePen />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Metadata</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-6">
          Once updated click "Apply" or "Discard" in app details view.
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <MetadataFormFields control={form.control} />

          <DialogFooter>
            <div className="flex flex-1 justify-between">
              <Button variant="outline" onClick={onCancel} type="reset">
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
