import type { ReactNode } from 'react';
import { useState } from 'react';
import { CreateContext } from './CreateContext';
import type { AppData } from './types';

const initAppDataState: AppData = {
  template: '',
  metadata: {
    name: '',
    author: '',
    description: '',
    version: '',
    homepage: '',
  },
  agent: {
    modelProvider: '',
    model: '',
    apiKey: '',
    prompt: '',
  },
  build: {},
  payment: {},
  bootstrap: {},
};

export const CreateContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [appData, setAppData] = useState<AppData>(initAppDataState);
  const setAppDataForm = (data: Partial<AppData>) => {
    setAppData((prevData) => ({ ...prevData, ...data }));
  };
  const resetStep = () => {
    setCurrentStep(0);
    setAppData(initAppDataState);
  };

  return (
    <CreateContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        resetStep,
        appData,
        setAppDataForm,
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};
