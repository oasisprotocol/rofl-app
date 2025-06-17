import { type FC } from 'react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';

type CreateFormNavigationProps = {
  handleNext: () => void;
  handleBack?: () => void;
};

export const CreateFormNavigation: FC<CreateFormNavigationProps> = ({
  handleNext,
  handleBack,
}) => {
  return (
    <div className="flex gap-4 w-full">
      {handleBack && (
        <Button className="flex-1" variant="secondary" onClick={handleBack}>
          Back
        </Button>
      )}
      <Button className="flex-1" onClick={handleNext}>
        Continue
      </Button>
    </div>
  );
};
