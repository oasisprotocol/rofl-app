import type { FC } from 'react';
import { Link } from 'react-router';
import Logotype from './logo.svg';
import { RainbowKitConnectButton } from '../RainbowKitConnectButton';

export const Header: FC = () => {
  return (
    <header className="py-3 px-5 border-b w-full border-border/40">
      <div className="flex justify-between items-center">
        <Link to="/">
          <img src={Logotype} alt="Oasis ROFL" />
        </Link>
        <RainbowKitConnectButton />
      </div>
    </header>
  );
};
