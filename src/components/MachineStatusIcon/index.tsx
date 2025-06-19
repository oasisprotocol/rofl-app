import { type FC } from 'react';
import { CircleCheck, CircleMinus } from 'lucide-react';
import { parseISO, addMinutes, isWithinInterval } from 'date-fns';
import { Badge } from '@oasisprotocol/ui-library/src/components/ui/badge';

type MachineStatusTypes = 'active' | 'removed' | 'expiring';

function getMachineStatus(
  removed: boolean,
  expiringSoon: boolean
): MachineStatusTypes {
  if (removed) return 'removed';
  if (expiringSoon) return 'expiring';
  return 'active';
}

type MachineStatusIconProps = {
  removed: boolean;
  expirationDate: string;
};

const isExpiringSoon = (expirationDate: string) => {
  try {
    const paidUntilDate = parseISO(expirationDate);
    const now = new Date();
    const tenMinutesFromNow = addMinutes(now, 10);

    return isWithinInterval(paidUntilDate, {
      start: now,
      end: tenMinutesFromNow,
    });
  } catch {
    return false;
  }
};

export const MachineStatusIcon: FC<MachineStatusIconProps> = ({
  removed,
  expirationDate,
}) => {
  const expiringSoon = isExpiringSoon(expirationDate);
  const status = getMachineStatus(removed, expiringSoon);
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
      case 'expiring':
        return <Badge className="bg-warning">Expiring Soon</Badge>;
      default:
        return null;
    }
  };

  return <>{getStatusIcon(status)}</>;
};
