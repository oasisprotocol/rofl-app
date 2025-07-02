import { useEffect, useCallback, type FC, FormEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label'
import { RadioGroup } from '@oasisprotocol/ui-library/src/components/ui/radio-group'
import { buildFormSchema, type BuildFormData } from '../../types/build-form.ts'
import { useNetwork } from '../../hooks/useNetwork'
import { getWhitelistedProviders } from '../../utils/providers'
import {
  useGetRuntimeRoflmarketProviders,
  useGetRuntimeRoflmarketProvidersAddressOffers,
} from '../../nexus/api'
import { InputFormField } from '../InputFormField'
import { BuildStepOffers } from './BuildStepOffers'
import * as oasisRT from '@oasisprotocol/client-rt'
import { sortOffersByPaymentTerms } from './helpers'
import { SelectFormField } from '../SelectFormField'

type BuildFormProps = {
  onSubmit: SubmitHandler<BuildFormData>
  build?: BuildFormData
  children: (props: {
    form: ReturnType<typeof useForm<BuildFormData>>
    handleFormSubmit: (e?: FormEvent<HTMLFormElement>) => void
    noOffersWarning: boolean
  }) => React.ReactNode
  selectedTemplateRequirements?: {
    tee: 'tdx' | 'sgx' | undefined
    cpus: number | undefined
    memory: number | undefined
    storage: number | undefined
  }
  offerId?: string
}

export const BuildForm: FC<BuildFormProps> = ({
  onSubmit,
  build,
  selectedTemplateRequirements,
  offerId,
  children,
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

  const providerValue = form.watch('provider')
  const providersOffersQuery = useGetRuntimeRoflmarketProvidersAddressOffers(
    network,
    'sapphire',
    providerValue,
  )
  const offers = providersOffersQuery.data?.data.offers
    .filter(offer => {
      if (offer.capacity === 0) return false

      if (!selectedTemplateRequirements) {
        return (
          offer.resources.tee === oasisRT.types.RoflmarketTeeType.TDX ||
          offer.resources.tee === oasisRT.types.RoflmarketTeeType.SGX
        )
      }

      if (
        selectedTemplateRequirements.tee === 'tdx' &&
        offer.resources.tee !== oasisRT.types.RoflmarketTeeType.TDX
      )
        return false
      if (
        selectedTemplateRequirements.tee === 'sgx' &&
        offer.resources.tee !== oasisRT.types.RoflmarketTeeType.SGX
      )
        return false
      if (selectedTemplateRequirements.cpus && offer.resources.cpus < selectedTemplateRequirements.cpus)
        return false
      if (selectedTemplateRequirements.memory && offer.resources.memory < selectedTemplateRequirements.memory)
        return false
      if (
        selectedTemplateRequirements.storage &&
        offer.resources.storage < selectedTemplateRequirements.storage
      )
        return false
      return true
    })
    .sort(sortOffersByPaymentTerms)

  useEffect(() => {
    form.reset({ ...build })
  }, [build, form])

  useEffect(() => {
    form.resetField('resources') // Clear offer selection if provider changes
  }, [providerValue, form])

  useEffect(() => {
    if (providerOptions.length === 1 && !form.getValues('provider')) {
      form.setValue('provider', providerOptions[0].value)
    }
  }, [providerOptions, form])

  useEffect(() => {
    if (offerId && offers && !form.getValues('resources')) {
      const selectedOffer = offers.find(offer => offer.id === offerId)
      if (selectedOffer) {
        form.setValue('resources', offerId)
      }
    }
    if (!offerId && offers && offers.length > 0 && !form.getValues('resources')) {
      form.setValue('resources', offers[0].id) // Preselect smallest offer
    }
  }, [offerId, offers, form])

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

  const handleFormSubmit = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      form.handleSubmit(onSubmit)()
    }
  }

  const noOffersWarning = providersOffersQuery.isFetched ? offers && offers.length === 0 : false

  return (
    <>
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
            label="Duration"
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
                1 hour is a very short period of time for the app. It may not be enough for debugging.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="resources">Size</Label>
          <Controller
            control={form.control}
            name="resources"
            render={({ field, fieldState }) => (
              <>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                  {offers?.sort(sortOffersByPaymentTerms).map(offer => (
                    <BuildStepOffers
                      key={offer.id}
                      offer={offer}
                      fieldValue={field.value}
                      multiplyNumber={Number(form.watch('number'))}
                      duration={form.watch('duration')}
                      onCostCalculated={handleCostCalculated}
                      network={network}
                      disabled={offerId ? offer.id !== offerId : false}
                    />
                  ))}
                </RadioGroup>
                {fieldState.error && (
                  <div className="text-destructive text-sm">{fieldState.error.message}</div>
                )}
              </>
            )}
          />
          {noOffersWarning && (
            <div className="text-destructive text-sm">
              No offers available for the provider. Please wait for offers to be available.
            </div>
          )}
        </div>
      </form>
      {children({ form, handleFormSubmit, noOffersWarning: !!noOffersWarning })}
    </>
  )
}
