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
          Version:{' '}
          <a
            href={`${GITHUB_REPOSITORY_URL}releases/tag/v${APP_VERSION}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {APP_VERSION}
          </a>{' '}
          <span className="hidden md:inline">
            (commit:{' '}
            <a
              href={`${GITHUB_REPOSITORY_URL}commit/${BUILD_COMMIT}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {BUILD_COMMIT.substring(0, 7)}
            </a>
            ) built on{' '}
            {new Intl.DateTimeFormat('en', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
            }).format(BUILD_DATETIME)}
          </span>
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
