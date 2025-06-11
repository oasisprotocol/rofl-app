import type { FC } from 'react';
import { Link } from 'react-router';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { Wallet } from 'lucide-react';
import Logotype from './logo.svg';

export const Header: FC = () => {
  return (
    <header className="py-3 px-5 border-b w-full border-border/40">
      <div className="flex justify-between items-center">
        <Link to="/">
          <img src={Logotype} alt="Oasis ROFL" />
        </Link>
        <Button>
          <Wallet /> Connect Wallet
        </Button>
      </div>
    </header>
  );
};
