import { parse } from 'yaml';
import tgbot from '../../../templates/tgbot/tgbot.png';
import tgbotTemplate from '../../../templates/tgbot/rofl-template.yaml?raw';
import defaultDeployments from '../../../templates/default-deployments.yaml?raw';
import type { MetadataFormData } from './types';

const parsedDefaultDeployments = parse(defaultDeployments);
const parsedTemplate = parse(tgbotTemplate);
const { compose: tgbotCompose, ...tgbotRofl } = parsedTemplate;

export const templates = [
  {
    name: parsedTemplate.name,
    description: parsedTemplate.description,
    image: tgbot,
    id: 'tgbot',
    initialValues: {
      metadata: {
        name: parsedTemplate.name || '',
        author: parsedTemplate.author || '',
        description: parsedTemplate.description || '',
        version: parsedTemplate.version || '',
        homepage: parsedTemplate.homepage || '',
        license: parsedTemplate.license || '',
      },
      build: {
        provider: '',
        resources: 'medium',
      },
    },
    yaml: {
      compose: tgbotCompose,
      rofl: tgbotRofl,
    },
    templateParser: (
      metadata: Partial<MetadataFormData>,
      network: 'mainnet' | 'testnet',
      appId: string
    ) => {
      return {
        ...tgbotRofl,
        title: metadata.name,
        description: metadata.description,
        author: metadata.author,
        version: metadata.version,
        homepage: metadata.homepage,
        license: metadata.license,
        deployments: {
          default: {
            ...parsedDefaultDeployments.deployments.default,
            app_id: appId,
            network,
          },
        },
      };
    },
  },
];

export const getTemplateById = (id: string | undefined) => {
  return templates.find((template) => template.id === id);
};
