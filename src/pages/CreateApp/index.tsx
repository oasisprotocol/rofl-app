import { type FC } from 'react';
import { useCreate } from './useCreate';
import { TemplateStep } from './TemplateStep';
import { MetadataStep } from './MetadataStep';
import { AgentStep } from './AgentStep';
import { BuildStep } from './BuildStep';
import { PaymentStep } from './PaymentStep';
import { BootstrapStep } from './BootstrapStep';

const CreateContent: FC = () => {
  const context = useCreate();

  if (!context) {
    return <div>Error: CreateContext not found</div>;
  }

  const { currentStep, setCurrentStep, appData, setAppDataForm } = context;
  const steps = [
    { component: TemplateStep, label: 'Template Selection' },
    { component: MetadataStep, label: 'Metadata Input' },
    { component: AgentStep, label: 'Agent Specific Stuff' },
    { component: BuildStep, label: 'Build and Deploy' },
    { component: PaymentStep, label: 'Payment' },
    { component: BootstrapStep, label: 'Bootstrap' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="[&>*]:md:max-h-none [&>*]:md:h-auto">
      {currentStep === 0 && (
        <TemplateStep handleNext={handleNext} setAppDataForm={setAppDataForm} />
      )}
      {currentStep === 1 && (
        <MetadataStep
          handleNext={handleNext}
          metadata={appData?.metadata}
          setAppDataForm={setAppDataForm}
        />
      )}
      {currentStep === 2 && (
        <AgentStep
          handleNext={handleNext}
          handleBack={handleBack}
          agent={appData?.agent}
          setAppDataForm={setAppDataForm}
        />
      )}
      {currentStep === 3 && (
        <BuildStep
          handleNext={handleNext}
          handleBack={handleBack}
          build={appData?.build}
          setAppDataForm={setAppDataForm}
        />
      )}
      {currentStep === 4 && (
        <PaymentStep handleNext={handleNext} handleBack={handleBack} />
      )}
      {currentStep === 5 && <BootstrapStep />}
    </div>
  );
};

export const Create: FC = () => {
  return <CreateContent />;
};
