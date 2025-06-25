import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../../components/EmptyState'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Plus } from 'lucide-react'

export const MyAppsEmptyState: FC = () => {
  return (
    <EmptyState
      title="Create your first ROFL App"
      description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas. Bibendum sed integer ac eget."
    >
      <Button asChild>
        <Link to="/create">
          Create
          <Plus className="h-4 w-4" />
        </Link>
      </Button>
    </EmptyState>
  )
}
