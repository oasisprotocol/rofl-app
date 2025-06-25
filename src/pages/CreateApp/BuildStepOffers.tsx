import { type FC } from 'react'
import { Label } from '@oasisprotocol/ui-library/src/components/ui/label'
import { RadioGroupItem } from '@oasisprotocol/ui-library/src/components/ui/radio-group'
import { Skeleton } from '@oasisprotocol/ui-library/src/components/ui/skeleton'
import { fromBaseUnits, multiplyBaseUnits } from '../../utils/number-utils'
import { MachineResources } from '../../components/MachineResources'
import { useGetRosePrice } from '../../coin-gecko/api'
import { type RoflMarketOffer } from '../../nexus/api'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import * as oasisRT from '@oasisprotocol/client-rt'
import { type BuildFormData } from './types'
import { useTicker } from '../../hooks/useTicker'

type BuildStepOffersProps = {
  offer: RoflMarketOffer
  fieldValue: string
  multiplyNumber?: number
  duration: BuildFormData['duration']
  onCostCalculated?: (roseCostInBaseUnits: string) => void
}

export const BuildStepOffers: FC<BuildStepOffersProps> = ({
  offer,
  multiplyNumber = 1,
  fieldValue,
  duration,
  onCostCalculated,
}) => {
  const ticker = useTicker()
  const targetTerms =
    duration === 'months' ? oasisRT.types.RoflmarketTerm.MONTH : oasisRT.types.RoflmarketTerm.HOUR
  const targetTermsPrice = (offer.payment?.native as { terms?: Record<oasisRT.types.RoflmarketTerm, string> })
    ?.terms?.[targetTerms]
  const multiplyBy = duration === 'days' ? multiplyNumber * 24 : multiplyNumber
  const { data: rosePrice, isLoading: isLoadingRosePrice, isFetched: isFetchedRosePrice } = useGetRosePrice()
  const roseCostInBaseUnits = multiplyBaseUnits(targetTermsPrice || '0', multiplyBy)
  const roseCost = fromBaseUnits(roseCostInBaseUnits)

  const isValidInput = Number.isInteger(multiplyNumber) && multiplyNumber > 0 && parseFloat(roseCost) > 0

  if (isValidInput && onCostCalculated && fieldValue === offer.id) {
    onCostCalculated(roseCostInBaseUnits)
  }

  return (
    <div key={offer.id} className="relative">
      <RadioGroupItem value={offer.id} id={offer.id} className="peer sr-only" />
      <Label
        htmlFor={offer.id}
        className={cn(
          '`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all hover:bg-card peer-checked:bg-card peer-checked:border-primary',
          fieldValue === offer.id ? 'bg-card border-primary' : 'border-border',
        )}
      >
        <div className="flex flex-col">
          <span className="text-md font-semibold mb-1 text-foreground capitalize">
            <>{offer.metadata['net.oasis.scheduler.offer'] || offer.id}</>
          </span>
          <span className="text-muted-foreground text-sm">
            <MachineResources
              cpus={offer.resources.cpus}
              memory={offer.resources.memory}
              storage={offer.resources.storage}
            />
          </span>
        </div>
        <div className="flex flex-col items-end">
          {!isValidInput ? (
            '-'
          ) : (
            <>
              {roseCost} {ticker}
              <span className="text-muted-foreground text-sm">
                {isLoadingRosePrice && <Skeleton className="w-full h-[20px] w-[80px]" />}
                {isFetchedRosePrice && rosePrice && (
                  <span>
                    ~
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(roseCost) * rosePrice)}
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </Label>
    </div>
  )
}
