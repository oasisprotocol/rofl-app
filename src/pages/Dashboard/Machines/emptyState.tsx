import { type FC } from 'react';
import { EmptyState } from '../../../components/EmptyState';

export const MachinesEmptyState: FC = () => {
  return (
    <EmptyState
      title="No machines running"
      description="At varius sit sit netus at integer vitae posuere id. Nulla imperdiet vestibulum amet ultrices egestas.
            Bibendum sed integer ac eget."
    />
  );
};
