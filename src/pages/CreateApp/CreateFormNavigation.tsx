import { type FC } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Spinner } from '../../components/Spinner'

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
    <div className="flex gap-4 w-full pt-4">
      {handleBack && (
        <Button className="flex-1" variant="secondary" onClick={handleBack}>
          Back
        </Button>
      )}
      <Button className="flex-1" disabled={disabled || isLoading} type="submit">
        {isLoading && <Spinner />}
        Continue
      </Button>
    </div>
  )
}
