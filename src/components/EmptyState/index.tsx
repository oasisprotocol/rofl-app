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
    <Card className="h-full rounded-md border-0 flex justify-center p-8 gap-2">
      <CardHeader className="text-xl font-semibold text-white text-center">
        {title}
      </CardHeader>
      <CardContent className="max-w-[60%] mx-auto text-gray-400 text-sm text-balance text-center leading-relaxed">
        {description}
      </CardContent>

      <CardFooter className="flex justify-center pt-2">{children}</CardFooter>
    </Card>
  );
}
