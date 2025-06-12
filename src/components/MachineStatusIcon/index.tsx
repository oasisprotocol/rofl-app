import { type FC } from 'react';
import { CircleCheck, CircleMinus } from 'lucide-react';

// TODO: this will need expiring badge too
type MachineStatusTypes = 'active' | 'removed';

function getMachineStatus(removed: boolean): MachineStatusTypes {
  return removed ? 'removed' : 'active';
}

type MachineStatusIconProps = {
  removed: boolean;
};

export const MachineStatusIcon: FC<MachineStatusIconProps> = ({ removed }) => {
  const status = getMachineStatus(removed);
  const getStatusIcon = (status: MachineStatusTypes) => {
    switch (status) {
      case 'active':
        return (
          <CircleCheck
            className="h-5 w-5"
            style={{ color: 'var(--success)' }}
          />
        );
      case 'removed':
        return (
          <CircleMinus className="h-5 w-5" style={{ color: 'var(--error)' }} />
        );
      default:
        return null;
    }
  };

  return <>{getStatusIcon(status)}</>;
};
