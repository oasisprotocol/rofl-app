import { useState, type FC } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logotype from './logo.svg'
import { RainbowKitConnectButton } from '../RainbowKitConnectButton'
import { Menu, Plus } from 'lucide-react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { useAccount } from 'wagmi'
import { Separator } from '@oasisprotocol/ui-library/src/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/sheet'
import { useIsMobile } from '@oasisprotocol/ui-library/src/hooks/use-mobile'
import { NavbarLink } from '../NavbarLink'
import { BuildBadge } from '../BuildBadge'
import { appsPath, createPath, dashboardPath, explorePath, machinesPath } from '../../pages/paths'
import { useNetwork } from '../../hooks/useNetwork'

export const Header: FC = () => {
  const isMobile = useIsMobile()
  const { isConnected } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const network = useNetwork()

  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to={isConnected ? dashboardPath(network) : '/'}>
          <img src={Logotype} alt="ROFL App" className="h-[36px]" />
        </Link>
        <BuildBadge />
      </div>
      <div className="flex items-center gap-4">
        {isConnected && (
          <Button asChild>
            <Link to={createPath()}>
              Create
              <Plus className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        <div className="hidden md:flex">
          <RainbowKitConnectButton />
        </div>

        <div className="md:hidden">
          <Sheet open={isMobile && isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <div>
                <Button variant="ghost" size="icon" className="hover:cursor-pointer">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </div>
            </SheetTrigger>
            <SheetContent side="top" className="gap-0">
              <SheetHeader className="mb-4 px-3 py-2.5 border-b">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex items-start">
                  <NavLink to="/" onClick={() => setIsOpen(false)}>
                    <img src={Logotype} alt="ROFL App" className="h-[36px]" />
                  </NavLink>
                </div>
              </SheetHeader>
              <nav>
                <div className="flex flex-col px-4 pb-4 gap-2">
                  <NavbarLink to={dashboardPath(network)} onClick={() => setIsOpen(false)}>
                    <span className="text-foreground">Dashboard</span>
                  </NavbarLink>
                  <NavbarLink to={appsPath(network)} onClick={() => setIsOpen(false)}>
                    <span className="text-foreground">Apps</span>
                  </NavbarLink>
                  <NavbarLink to={machinesPath(network)} onClick={() => setIsOpen(false)}>
                    <span className="text-foreground">Machines</span>
                  </NavbarLink>
                  <NavbarLink to={explorePath()} onClick={() => setIsOpen(false)}>
                    <span className="text-foreground">Explore</span>
                  </NavbarLink>
                </div>

                <div className="space-y-2.5">
                  <Separator className="bg-border" />
                </div>

                <div className="p-2">
                  <RainbowKitConnectButton onMobileClose={() => setIsOpen(false)} />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
