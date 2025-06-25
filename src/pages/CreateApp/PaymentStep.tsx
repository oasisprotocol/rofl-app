import { type FC } from 'react'
import { CreateLayout } from './CreateLayout'
import { CreateFormHeader } from './CreateFormHeader'
import { CreateFormNavigation } from './CreateFormNavigation'
import { type AppData } from './types'
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import { fromBaseUnits } from '../../utils/number-utils'

type AgentStepProps = {
  handleNext: () => void
  handleBack: () => void
  selectedTemplateName?: string
  appData?: AppData
}

export const PaymentStep: FC<AgentStepProps> = ({
  handleNext,
  handleBack,
  selectedTemplateName,
  appData,
}) => {
  return (
    <CreateLayout
      currentStep={4}
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
        title="Payment"
        description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
      />

      <div className="space-y-2 w-full">
        <div className="flex justify-between items-center">
          <span className="text-white text-sm">Machine cost</span>
          <span className="text-white text-sm">
            {appData?.build?.roseCostInBaseUnits
              ? `${fromBaseUnits(appData.build.roseCostInBaseUnits)} ROSE`
              : '-'}
          </span>
        </div>

        <Separator className="" />

        <div className="flex justify-between items-center">
          <span className="text-white text-sm">Fees</span>
          <span className="text-white text-sm">-</span>
        </div>

        <Separator className="" />

        <div className="flex justify-between items-center">
          <span className="text-white text-sm font-medium">Total</span>
          <span className="text-white text-sm font-medium">
            {appData?.build?.roseCostInBaseUnits
              ? `${fromBaseUnits(appData.build.roseCostInBaseUnits)} ROSE`
              : '-'}
          </span>
        </div>
      </div>

      <CreateFormNavigation handleNext={handleNext} handleBack={handleBack} />
    </CreateLayout>
  )
}
