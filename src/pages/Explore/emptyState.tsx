import { type FC } from 'react'
import { EmptyState } from '../../components/EmptyState'

export const ExploreEmptyState: FC = () => {
  return (
    <EmptyState
      title="Apps preview not available"
      description="Try again later or check your network connection."
    />
  )
}
