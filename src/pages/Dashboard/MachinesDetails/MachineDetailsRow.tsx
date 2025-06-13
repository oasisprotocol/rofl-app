import type { FC } from 'react';
import { cn } from '@oasisprotocol/ui-library/src/lib/utils';

type MachineDetailsRowProps = {
  className?: string;
  label: string;
  children: React.ReactNode;
};

export const MachineDetailsRow: FC<MachineDetailsRowProps> = ({
  className,
  label,
  children,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-[minmax(200px,auto)_1fr]',
        className
      )}
    >
      <span className="text-foreground text-sm">{label}</span>
      <span className="text-muted-foreground text-sm">{children}</span>
    </div>
  );
};
