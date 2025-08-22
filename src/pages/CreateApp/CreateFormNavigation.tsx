import { type FC } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'
import { Spinner } from '../../components/Spinner'
import { ArrowLeft } from 'lucide-react'

type CreateFormNavigationProps = {
  handleBack?: () => void
  disabled?: boolean
  isLoading?: boolean
}

export const CreateFormNavigation: FC<CreateFormNavigationProps> = ({
  handleBack,
  disabled = false,
  isLoading = false,
}) => {
  return (
    <div
      className={cn('flex justify-between gap-4 w-full pt-4', handleBack ? 'justify-between' : 'justify-end')}
    >
      {handleBack && (
        <Button variant="secondary" onClick={handleBack}>
          <ArrowLeft />
        </Button>
      )}
      <Button disabled={disabled || isLoading} type="submit">
        {isLoading && <Spinner />}
        Continue
      </Button>
    </div>
  )
}
