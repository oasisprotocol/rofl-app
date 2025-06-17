import { type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';

type MetadataStepProps = {
  handleNext: () => void;
};

export const MetadataStep: FC<MetadataStepProps> = ({ handleNext }) => {
  return (
    <CreateLayout
      currentStep={1}
      hints={[
        {
          title: 'Tips and Tricks',
          description:
            'Ultricies convallis urna habitant blandit risus ultrices facilisi donec. Bibendum semper convallis sit tellus tincidunt tincidunt.',
        },
      ]}
    >
      <CreateFormHeader
        title="Input Your Public ROFL Metadata"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet
          vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />
      <CreateFormNavigation handleNext={handleNext} />
    </CreateLayout>
  );
};
