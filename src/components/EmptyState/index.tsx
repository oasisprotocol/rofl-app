import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@oasisprotocol/ui-library/src/components/ui/card';
import { useAccount } from 'wagmi';

interface EmptyStateProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  const { isConnected } = useAccount();

  return (
    <Card className="h-full rounded-md border-0 flex justify-center p-8 gap-2">
      <CardHeader className="text-xl font-semibold text-white text-center">
        {isConnected ? title : 'Wallet is not connected'}
      </CardHeader>
      <CardContent className="md:max-w-[60%] mx-auto text-gray-400 text-sm text-balance text-center leading-relaxed">
        {isConnected
          ? description
          : 'Please connect your wallet to to gain access to the view.'}
      </CardContent>

      <CardFooter className="flex justify-center pt-2">
        {isConnected ? children : null}
      </CardFooter>
    </Card>
  );
}
