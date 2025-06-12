import { type FC } from 'react';
import {
  Card,
  CardContent,
} from '@oasisprotocol/ui-library/src/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string | number;
};

export const MetricCard: FC<MetricCardProps> = ({ title, value }) => {
  return (
    <Card className="rounded-md p-0">
      <CardContent className="p-6">
        <div className="text-5xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  );
};
