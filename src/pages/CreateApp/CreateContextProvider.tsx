import type { ReactNode } from 'react';
import { useState } from 'react';
import { CreateContext } from './CreateContext';

export const CreateContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const resetStep = () => {
    setCurrentStep(0);
  };

  return (
    <CreateContext.Provider value={{ currentStep, setCurrentStep, resetStep }}>
      {children}
    </CreateContext.Provider>
  );
};
