import { type FC } from 'react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link, type To } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  to: To;
  disabled?: boolean;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  to,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 border-b pb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {disabled ? (
        <Button variant="outline" disabled>
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link to={to}>
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
};

// 20px white
// 14px muted-foreground
