import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@oasisprotocol/ui-library/src/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <Card className="h-full rounded-md border-0 flex justify-center p-6 gap-2">
      <CardHeader className="text-2xl font-semibold text-white text-center">
        {title}
      </CardHeader>
      <CardContent className="max-w-[50%] mx-auto text-gray-400 text-md text-balance text-center leading-relaxed">
        {description}
      </CardContent>

      <CardFooter className="flex justify-center pt-2 pb-6">
        {children}
      </CardFooter>
    </Card>
  );
}
