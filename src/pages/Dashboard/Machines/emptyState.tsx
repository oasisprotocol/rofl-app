import { type FC } from 'react'
import { EmptyState } from '../../../components/EmptyState'

export const MachinesEmptyState: FC = () => {
  return (
    <EmptyState
      title="You currently have no machines running"
      description="Once you create your first app, the machine(s) running it will appear here."
    />
  )
}
