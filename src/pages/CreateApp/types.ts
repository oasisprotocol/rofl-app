import { z } from 'zod';

export const metadataFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required.',
  }),
  author: z.string().min(1, {
    message: 'Author is required.',
  }),
  description: z.string().min(1, {
    message: 'Description is required.',
  }),
  version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      {
        message: 'Version must be valid semver format.',
      }
    ),
  homepage: z.string().optional(),
});

export type MetadataFormData = z.infer<typeof metadataFormSchema>;

export type AppData = {
  template?: string;
  metadata?: MetadataFormData;
  agent?: Record<string, unknown>;
  build?: Record<string, unknown>;
  payment?: Record<string, unknown>;
  bootstrap?: Record<string, unknown>;
};
