import { type FC } from 'react'
import { ExploreEmptyState } from './emptyState'
import { AppsList } from '../../components/AppsList'

export const Explore: FC = () => {
  return <AppsList emptyState={<ExploreEmptyState />} type="explore" />
}
