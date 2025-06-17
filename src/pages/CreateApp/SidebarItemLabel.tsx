import type { FC } from 'react';
import { cn } from '@oasisprotocol/ui-library/src/lib/utils';
import { CircleCheckBig } from 'lucide-react';

type CreateLayoutProps = {
  active: boolean;
  completed: boolean;
  index: number;
  label: string;
};

export const SidebarItemLabel: FC<CreateLayoutProps> = ({
  active,
  completed,
  index,
  label,
}) => {
  return (
    <div className="flex items-center gap-3 py-2">
      {completed && (
        <CircleCheckBig
          className="h-6 w-6"
          style={{ color: 'var(--success)' }}
        />
      )}
      {!completed && (
        <div
          className={cn(
            'text-primary-foreground min-w-[24px] w-[24px] h-[24px] rounded-full flex items-center justify-center text-xs font-semibold',
            active ? 'bg-primary' : 'bg-muted'
          )}
        >
          {index + 1}
        </div>
      )}
      <span
        className={cn(
          'text-sm',
          active ? 'font-semibold text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  );
};
