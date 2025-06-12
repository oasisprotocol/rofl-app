import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { FC, PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'

interface NavbarLinkProps extends PropsWithChildren {
  to?: string
  className?: string
  onClick?: () => void
}

export const NavbarLink: FC<NavbarLinkProps> = ({ children, to, className, onClick }) => {
  return (
    <Button
      variant="ghost"
      className={`${className} flex items-center justify-start px-2 py-2.5 rounded-md text-base font-medium`}
      asChild={!!to}
      onClick={onClick}
    >
      {to ? (
        <NavLink to={to}>
          {({ isActive }) => (
            <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{children}</span>
          )}
        </NavLink>
      ) : (
        children
      )}
    </Button>
  )
}
