import { useEffect, useCallback, type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label'
import { RadioGroup } from '@oasisprotocol/ui-library/src/components/ui/radio-group'
import { buildFormSchema, type BuildFormData } from './types'
import { SelectFormField } from './SelectFormField'
import { useNetwork } from '../../hooks/useNetwork'
import { getWhitelistedProviders } from '../../utils/providers'
import {
  useGetRuntimeRoflmarketProviders,
  useGetRuntimeRoflmarketProvidersAddressOffers,
} from '../../nexus/api'
import { InputFormField } from './InputFormField'
import { BuildStepOffers } from './BuildStepOffers'
import * as oasisRT from '@oasisprotocol/client-rt'

type AgentStepProps = {
  handleNext: () => void
  handleBack: () => void
  build?: BuildFormData
  setAppDataForm: (data: { build: BuildFormData }) => void
  selectedTemplateName?: string
}

export const BuildStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  build,
  setAppDataForm,
  selectedTemplateName,
}) => {
  const network = useNetwork()
  const providersQuery = useGetRuntimeRoflmarketProviders(network, 'sapphire')
  const { data } = providersQuery
  const providers = data?.data.providers
  const whitelistedProviders = getWhitelistedProviders(providers, network)
  const providerOptions = whitelistedProviders?.map(provider => ({
    value: provider.address,
    label: (provider.metadata?.['net.oasis.provider.name'] as string) || provider.address,
  }))
  const form = useForm<BuildFormData>({
    resolver: zodResolver(buildFormSchema),
    defaultValues: { ...build },
  })
  const handleCostCalculated = useCallback(
    (roseCostInBaseUnits: string) => {
      form.setValue('roseCostInBaseUnits', roseCostInBaseUnits)
    },
    [form],
  )

  useEffect(() => {
    form.reset({ ...build })
  }, [build, form])

  useEffect(() => {
    if (providerOptions.length === 1 && !form.getValues('provider')) {
      form.setValue('provider', providerOptions[0].value)
    }
  }, [providerOptions, form])

  const providerValue = form.watch('provider')
  const providersOffersQuery = useGetRuntimeRoflmarketProvidersAddressOffers(
    network,
    'sapphire',
    providerValue,
  )
  const offers = providersOffersQuery.data?.data.offers.filter(
    offer => offer.resources.tee === oasisRT.types.RoflmarketTeeType.TDX,
  )

  // API terms are like 1=hour, 2=month, 3=year, but only hour is mandatory
  // Testnet provider provide only hourly terms
  const hasMonthlyTerms = offers?.some(
    offer =>
      (offer.payment?.native as { terms?: Record<oasisRT.types.RoflmarketTerm, string> })?.terms?.[
        oasisRT.types.RoflmarketTerm.MONTH
      ],
  )

  const durationOptions: { value: BuildFormData['duration']; label: string }[] = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    ...(hasMonthlyTerms ? ([{ value: 'months', label: 'Months' }] as const) : []),
  ]

  const onSubmit = (values: BuildFormData) => {
    setAppDataForm({ build: values })
    handleNext()
  }

  const handleFormSubmit = () => {
    form.trigger().then(isValid => {
      if (isValid) {
        form.handleSubmit(onSubmit)()
      }
    })
  }

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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 w-full">
        <SelectFormField
          control={form.control}
          name="provider"
          label="Provider"
          placeholder="Select provider"
          options={[...providerOptions]}
          disabled
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <SelectFormField
            control={form.control}
            name="duration"
            label="Duration period"
            placeholder="Select duration"
            options={[...durationOptions]}
          />

          <div>
            <InputFormField
              control={form.control}
              name="number"
              label={`Number of ${form.watch('duration') || 'hours'}`}
              placeholder="Enter number"
              type="number"
              min={1}
            />
            {form.watch('duration') === 'hours' && Number(form.watch('number')) === 1 && (
              <div className="text-sm text-warning leading-tight mt-2">
                1 hour is a very short period of time for a ROFL app. It may not be enough for debugging.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="resources">Resources</Label>
          <Controller
            control={form.control}
            name="resources"
            render={({ field, fieldState }) => (
              <>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                  {offers?.map(offer => (
                    <BuildStepOffers
                      key={offer.id}
                      offer={offer}
                      fieldValue={field.value}
                      multiplyNumber={Number(form.watch('number'))}
                      duration={form.watch('duration')}
                      onCostCalculated={handleCostCalculated}
                    />
                  ))}
                </RadioGroup>
                {fieldState.error && (
                  <div className="text-destructive text-sm">{fieldState.error.message}</div>
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
  )
}
