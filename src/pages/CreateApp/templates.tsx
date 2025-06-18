import Empyreal from './images/empyreal.svg';

export const templates = [
  {
    name: 'Empyreal',
    description:
      'Multi-agent simulation framework designed for creating, deploying, and managing AI agents across different platforms.',
    image: Empyreal,
    id: 'empyreal',
  },
];

export const getTemplateById = (id: string | undefined) => {
  return templates.find((template) => template.id === id);
};
