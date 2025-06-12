import type { FC } from 'react';
import { Link } from 'react-router-dom';
import Logotype from './logo.svg';
import { RainbowKitConnectButton } from '../RainbowKitConnectButton';
import { Plus } from 'lucide-react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { useAccount } from 'wagmi';

export const Header: FC = () => {
  const { isConnected } = useAccount();

  return (
    <header className="flex-shrink-0 py-3 px-5 border-b w-full border-border/40">
      <div className="flex justify-between items-center">
        <Link to="/">
          <img src={Logotype} alt="Oasis ROFL" />
        </Link>
        <div className="flex items-center gap-4">
          {isConnected && (
            <Button asChild>
              <Link to="/dashboard/create">
                Create
                <Plus className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          <RainbowKitConnectButton />
        </div>
      </div>
    </header>
  );
};
