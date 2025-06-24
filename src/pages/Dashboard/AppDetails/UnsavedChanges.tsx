import { type FC } from 'react';
import { useBlocker } from 'react-router-dom';
import { DiscardChanges } from './DiscardButton';
import { ApplyChanges } from './ApplyChanges';
import { cn } from '@oasisprotocol/ui-library/src/lib/utils';

type UnsavedChangesProps = {
  isDirty: boolean;
  onDiscard: () => void;
  onConfirm: () => void;
};

export const UnsavedChanges: FC<UnsavedChangesProps> = ({
  isDirty,
  onDiscard,
  onConfirm,
}) => {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-md bg-card absolute right-6 bottom-16',
        !isDirty && 'hidden',
        blocker.state === 'blocked' && 'animate-bounce'
      )}
    >
      <span className="text-sm font-semibold pr-6">Unsaved Changes</span>
      <DiscardChanges disabled={!isDirty} onConfirm={onDiscard} />
      <ApplyChanges
        disabled={!isDirty}
        onConfirm={() => {
          onConfirm();
        }}
      />
    </div>
  );
};
