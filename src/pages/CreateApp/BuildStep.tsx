import { useEffect, type FC } from 'react';
import { CreateLayout } from './CreateLayout';
import { CreateFormHeader } from './CreateFormHeader';
import { CreateFormNavigation } from './CreateFormNavigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@oasisprotocol/ui-library/src/components/ui/radio-group';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@oasisprotocol/ui-library/src/components/ui/alert';
import { Info } from 'lucide-react';
import { buildFormSchema, type BuildFormData } from './types';
import { SelectFormField } from './SelectFormField';
import { useGetRosePrice } from '../../coin-gecko/api';
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton';
import { useNetwork } from '../../hooks/useNetwork';
import { getWhitelistedProviders } from '../../utils/providers';
import {
  useGetRuntimeRoflmarketProviders,
  useGetRuntimeRoflmarketProvidersAddressOffers,
} from '../../nexus/api';
import { fromBaseUnits } from '../../utils/number-utils';
import { MachineResources } from '../../components/MachineResources';
import { InputFormField } from './InputFormField';

type AgentStepProps = {
  handleNext: () => void;
  handleBack: () => void;
  build?: BuildFormData;
  setAppDataForm: (data: { build: BuildFormData }) => void;
  selectedTemplateName?: string;
};

export const BuildStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  build,
  setAppDataForm,
  selectedTemplateName,
}) => {
  const network = useNetwork();
  const providersQuery = useGetRuntimeRoflmarketProviders(network, 'sapphire');
  const { data } = providersQuery;
  const providers = data?.data.providers;
  const whitelistedProviders = getWhitelistedProviders(providers, network);
  const providerOptions = whitelistedProviders?.map((provider) => ({
    value: provider.address,
    label:
      (provider.metadata?.['net.oasis.provider.name'] as string) ||
      provider.address,
  }));
  const {
    data: rosePrice,
    isLoading: isLoadingRosePrice,
    isFetched: isFetchedRosePrice,
  } = useGetRosePrice();
  const form = useForm<BuildFormData>({
    resolver: zodResolver(buildFormSchema),
    defaultValues: { ...build },
  });

  useEffect(() => {
    form.reset({ ...build });
  }, [build, form]);

  useEffect(() => {
    if (providerOptions.length === 1 && !form.getValues('provider')) {
      form.setValue('provider', providerOptions[0].value);
    }
  }, [providerOptions, form]);

  const providerValue = form.watch('provider');
  const providersOffers = useGetRuntimeRoflmarketProvidersAddressOffers(
    network,
    'sapphire',
    providerValue
  );

  const resourceOptions =
    providersOffers.data?.data.offers.map((offer) => ({
      id: offer.id,
      name: (offer.metadata['net.oasis.scheduler.offer'] as string) || offer.id,
      specs: (
        <MachineResources
          cpus={offer.resources.cpus}
          memory={offer.resources.memory}
          storage={offer.resources.storage}
        />
      ),
      price: `${fromBaseUnits(
        (offer.payment?.native as { terms?: Record<string, string> })?.terms?.[
          '1'
        ] || '0',
        18
      )} ROSE`,
    })) || [];

  // API terms are like 1=hour, 2=month, 3=year, but only hour is mandatory
  const durationOptions = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'months', label: 'Months' },
  ];

  useEffect(() => {
    if (providerValue) {
      providersOffers.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerValue]);

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
        <SelectFormField
          control={form.control}
          name="provider"
          label="Provider"
          placeholder="Select provider"
          options={[...providerOptions]}
          disabled
        />

        <SelectFormField
          control={form.control}
          name="duration"
          label="Duration period"
          placeholder="Select duration"
          options={[...durationOptions]}
        />

        <InputFormField
          control={form.control}
          name="number"
          label={`Number of ${form.watch('duration') || 'hours'}`}
          placeholder="Enter number"
          type="number"
        />

        {form.watch('duration') === 'hours' &&
          Number(form.watch('number')) === 1 && (
            <Alert>
              <>
                <Info />
                <AlertTitle>Short period of time</AlertTitle>
                <AlertDescription>
                  1 hour is a very short period of time for a ROFL app. It may
                  not be enough for testing or debugging.
                </AlertDescription>
              </>
            </Alert>
          )}

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
                          <span className="text-md font-semibold mb-1 text-foreground capitalize">
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
                            {isLoadingRosePrice && (
                              <Skeleton className="w-full h-[20px] w-[80px]" />
                            )}
                            {isFetchedRosePrice && rosePrice && (
                              <span>
                                ~
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(parseFloat(option.price) * rosePrice)}
                              </span>
                            )}
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
