import { type FC } from 'react'
import { useIsMobile } from '@oasisprotocol/ui-library/src/hooks/use-mobile'

export const Footer: FC = () => {
  const isMobile = useIsMobile()
  const label = isMobile ? 'OPF' : 'Oasis Protocol Foundation'

  return (
    <footer className="w-full flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        Copyright © {label} {new Date().getFullYear()}
      </p>

      <div className="flex items-center gap-2.5">
        <p className="text-xs text-muted-foreground">
          <a href="#" rel="noopener noreferrer" target="_blank">
            Version {APP_VERSION}
          </a>
        </p>
        <span className="text-xs text-muted-foreground">|</span>
        <a
          className="text-xs text-muted-foreground"
          href="https://oasis.net/privacy-policy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  )
}
