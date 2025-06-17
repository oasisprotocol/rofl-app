import { createContext } from 'react';

type CreateContextType = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetStep: () => void;
};

export const CreateContext = createContext<CreateContextType | undefined>(
  undefined
);
