import type { FC } from 'react'
import { FathomAnalytics } from '../FathomAnalytics'
import { Outlet } from 'react-router-dom'
import { Toaster as Sonner, ToasterProps } from 'sonner'

// TODO: use import { Toaster } from '@oasisprotocol/ui-library' when it doesn't break
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={'dark'}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export const RootLayout: FC = () => (
  <>
    <FathomAnalytics />
    <Toaster />
    <Outlet />
  </>
)
