import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@oasisprotocol/ui-library/src/components/ui/card';
import { cn } from '@oasisprotocol/ui-library/src/lib/utils';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  className,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'h-full rounded-md border-0 flex justify-center p-8 gap-2',
        className
      )}
    >
      <CardHeader className="text-xl font-semibold text-white text-center">
        {title}
      </CardHeader>
      <CardContent className="md:max-w-[60%] mx-auto text-gray-400 text-sm text-balance text-center leading-relaxed">
        {description}
      </CardContent>

      <CardFooter className="flex justify-center pt-2">{children}</CardFooter>
    </Card>
  );
}
