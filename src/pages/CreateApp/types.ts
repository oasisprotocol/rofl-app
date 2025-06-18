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

export const agentFormSchema = z.object({
  modelProvider: z.string().min(1, {
    message: 'Model provider is required.',
  }),
  model: z.string().min(1, {
    message: 'Model is required.',
  }),
  apiKey: z.string().min(1, {
    message: 'API key is required.',
  }),
  prompt: z.string().min(1, {
    message: 'Prompt is required.',
  }),
});

export const buildFormSchema = z.object({
  artifacts: z.string().min(1, {
    message: 'Artifacts are required.',
  }),
  provider: z.string().min(1, {
    message: 'Provider is required.',
  }),
  resources: z.string().min(1, {
    message: 'Resources are required.',
  }),
});

export type TemplateFormData = string;
export type MetadataFormData = z.infer<typeof metadataFormSchema>;
export type AgentFormData = z.infer<typeof agentFormSchema>;
export type BuildFormData = z.infer<typeof buildFormSchema>;

export type AppData = {
  template?: string;
  metadata?: MetadataFormData;
  agent?: AgentFormData;
  build?: BuildFormData;
  payment?: Record<string, unknown>;
};
