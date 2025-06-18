import { useEffect, type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { InputFormField } from './InputFormField';
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@oasisprotocol/ui-library/src/components/ui/radio-group';
import { buildFormSchema, type BuildFormData } from './types';

type AgentStepProps = {
  handleNext: () => void;
  handleBack: () => void;
  build?: BuildFormData;
  setAppDataForm: (data: { build: BuildFormData }) => void;
  selectedTemplateName?: string;
};

const resourceOptions = [
  {
    id: 'small',
    name: 'Small',
    specs: '1CPU, 2GB RAM, 10GB Storage',
    price: '500 $ROSE',
    usdPrice: '~35.00 USD',
  },
  {
    id: 'medium',
    name: 'Medium',
    specs: '2CPU, 4GB RAM, 25GB Storage',
    price: '1000 $ROSE',
    usdPrice: '~70.00 USD',
  },
  {
    id: 'large',
    name: 'Large',
    specs: '4CPU, 8GB RAM, 60GB Storage',
    price: '1500 $ROSE',
    usdPrice: '~105.00 USD',
  },
];

export const BuildStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  build,
  setAppDataForm,
  selectedTemplateName,
}) => {
  const form = useForm<BuildFormData>({
    resolver: zodResolver(buildFormSchema),
    defaultValues: { ...build },
  });

  useEffect(() => {
    form.reset({ ...build });
  }, [build, form]);

  const onSubmit = (values: BuildFormData) => {
    setAppDataForm({ build: values });
    handleNext();
  };

  const handleFormSubmit = () => {
    form.trigger().then((isValid) => {
      if (isValid) {
        form.handleSubmit(onSubmit)();
      }
    });
  };

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
      selectedTemplateName={selectedTemplateName}
    >
      <CreateFormHeader
        title="Build and Deploy"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 mb-6 w-full"
      >
        <InputFormField
          control={form.control}
          name="artifacts"
          label="Base Artifacts"
          placeholder="oasis boot 0.5.0, ROFL container 0.5.1"
        />

        <InputFormField
          control={form.control}
          name="provider"
          label="Provider"
          placeholder="OPF"
        />
        <div className="grid gap-2">
          <Label htmlFor="resources">Resources</Label>
          <Controller
            control={form.control}
            name="resources"
            render={({ field, fieldState }) => (
              <>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="space-y-2"
                >
                  {resourceOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.id}
                        className={`
                              flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all
                              hover:bg-card peer-checked:bg-card peer-checked:border-primary
                              ${
                                field.value === option.id
                                  ? 'bg-card border-primary'
                                  : 'border-border'
                              }
                              `}
                      >
                        <div className="flex flex-col">
                          <span className="text-md font-semibold mb-1 text-foreground">
                            {option.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {option.specs}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-md font-semibold mb-1 text-foreground">
                            {option.price}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {option.usdPrice}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {fieldState.error && (
                  <div className="text-destructive text-sm">
                    {fieldState.error.message}
                  </div>
                )}
              </>
            )}
          />
        </div>
        <CreateFormNavigation
          handleNext={handleFormSubmit}
          handleBack={handleBack}
          disabled={form.formState.isSubmitting}
        />
      </form>
    </CreateLayout>
  );
};
