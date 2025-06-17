import { type FC } from 'react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';

type CreateFormNavigationProps = {
  handleNext: () => void;
  handleBack?: () => void;
  disabled?: boolean;
};

export const CreateFormNavigation: FC<CreateFormNavigationProps> = ({
  handleNext,
  handleBack,
  disabled = false,
}) => {
  return (
    <div className="flex gap-4 w-full pt-4">
      {handleBack && (
        <Button className="flex-1" variant="secondary" onClick={handleBack}>
          Back
        </Button>
      )}
      <Button className="flex-1" onClick={handleNext} disabled={disabled}>
        Continue
      </Button>
    </div>
  );
};
