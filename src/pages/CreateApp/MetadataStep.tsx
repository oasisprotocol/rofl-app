import { type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';

type MetadataStepProps = {
  handleNext: () => void;
};

export const MetadataStep: FC<MetadataStepProps> = ({ handleNext }) => {
  return (
    <CreateLayout currentStep={1}>
      <div className="max-w-md mx-auto px-8 py-12 flex flex-col gap-8 items-center">
        <CreateFormHeader
          title="Input Your Public ROFL Metadata"
          description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet
            vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
        />
        <CreateFormNavigation handleNext={handleNext} />
      </div>
    </CreateLayout>
  );
};
