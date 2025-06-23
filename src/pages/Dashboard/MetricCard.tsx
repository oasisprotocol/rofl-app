import { type FC } from 'react';
import {
  Card,
  CardContent,
} from '@oasisprotocol/ui-library/src/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string | number | undefined;
  isTotalCountClipped?: boolean;
};

export const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  isTotalCountClipped,
}) => {
  return (
    <Card className="rounded-md p-0">
      <CardContent className="p-6">
        <div className="text-5xl font-bold text-foreground mb-1">
          {isTotalCountClipped && '> '}
          {value ?? 0}
        </div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  );
};
