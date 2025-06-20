import { useState, type FC } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCreate } from '../../pages/CreateApp/useCreate';
import Logotype from './logo.svg';
import { RainbowKitConnectButton } from '../RainbowKitConnectButton';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { useAccount } from 'wagmi';
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/sheet';
import { useIsMobile } from '@oasisprotocol/ui-library/src/hooks/use-mobile';
import { NavbarLink } from '../NavbarLink';

export const Header: FC = () => {
  const isMobile = useIsMobile();
  const { isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const createContext = useCreate();

  const handleCreateClick = () => {
    if (createContext) {
      createContext.resetStep();
    }
    navigate('/create');
  };

  return (
    <div className="w-full flex justify-between items-center">
      <Link to={isConnected ? '/dashboard' : '/'}>
        <img src={Logotype} alt="Oasis ROFL" className="h-[36px]" />
      </Link>

      <div className="hidden md:flex">
        <div className="flex items-center gap-4">
          {isConnected && (
            <Button onClick={handleCreateClick}>
              Create
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          )}
          <RainbowKitConnectButton />
        </div>
      </div>

      <div className="md:hidden">
        <Sheet open={isMobile && isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:cursor-pointer"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="top" className="w-full">
            <SheetHeader>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex items-start px-3 py-2.5">
                <NavLink to="/" onClick={() => setIsOpen(false)}>
                  <img src={Logotype} alt="Oasis ROFL" />
                </NavLink>
              </div>
            </SheetHeader>
            <nav className="flex flex-col">
              <div className="p-2">
                <NavbarLink to="/dashboard" onClick={() => setIsOpen(false)}>
                  Dashboard
                </NavbarLink>
                <NavbarLink
                  to="/dashboard/apps"
                  onClick={() => setIsOpen(false)}
                >
                  My Apps
                </NavbarLink>
                <NavbarLink
                  to="/dashboard/machines"
                  onClick={() => setIsOpen(false)}
                >
                  Machines
                </NavbarLink>
                <NavbarLink to="/explore" onClick={() => setIsOpen(false)}>
                  Explore
                </NavbarLink>
              </div>

              <div className="space-y-2.5">
                <Separator className="bg-border" />
              </div>

              <div className="p-2">
                <RainbowKitConnectButton
                  onMobileClose={() => setIsOpen(false)}
                />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
