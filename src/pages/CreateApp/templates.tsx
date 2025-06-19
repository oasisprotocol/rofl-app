import { parse } from 'yaml';
import tgbot from '../../../templates/tgbot/tgbot.png';
import tgbotTemplate from '../../../templates/tgbot/rofl-template.yaml?raw';
import type { MetadataFormData } from './types';

const parsedTemplate = parse(tgbotTemplate);

export const templates = [
  {
    name: parsedTemplate.title,
    description: parsedTemplate.description,
    image: tgbot,
    id: 'tgbot',
    initialValues: {
      metadata: {
        name: parsedTemplate.title,
        author: parsedTemplate.author,
        description: parsedTemplate.description,
        version: parsedTemplate.version,
        homepage: parsedTemplate.homepage,
      },
      build: {
        provider: 'OPF',
        resources: 'medium',
      },
    },
    templateParser: (metadata: Partial<MetadataFormData>) => {
      return {
        ...parsedTemplate,
        title: metadata.name,
        description: metadata.description,
        author: metadata.author,
        version: metadata.version,
        homepage: metadata.homepage,
      };
    },
  },
];

export const getTemplateById = (id: string | undefined) => {
  return templates.find((template) => template.id === id);
};
