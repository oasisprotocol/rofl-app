import { type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';

type AgentStepProps = {
  handleNext: () => void;
  handleBack: () => void;
};
export const PaymentStep: FC<AgentStepProps> = ({ handleNext, handleBack }) => {
  return (
    <CreateLayout currentStep={4}>
      <div className="max-w-md mx-auto px-8 py-12 flex flex-col gap-8 items-center">
        <CreateFormHeader
          title="Payment"
          description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
        />
        <CreateFormNavigation handleNext={handleNext} handleBack={handleBack} />
      </div>
    </CreateLayout>
  );
};
