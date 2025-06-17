import { type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';

type AgentStepProps = {
  handleNext: () => void;
  handleBack: () => void;
};

export const BuildStep: FC<AgentStepProps> = ({ handleNext, handleBack }) => {
  return (
    <CreateLayout
      currentStep={3}
      hints={[
        {
          title: 'Tips and Tricks',
          description:
            'Ultricies convallis urna habitant blandit risus ultrices facilisi donec. Bibendum semper convallis sit tellus tincidunt tincidunt.',
        },
      ]}
    >
      <CreateFormHeader
        title="Build and Deploy"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />
      <CreateFormNavigation handleNext={handleNext} handleBack={handleBack} />
    </CreateLayout>
  );
};
