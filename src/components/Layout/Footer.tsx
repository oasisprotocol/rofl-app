import type { FC } from 'react';

export const Footer: FC = () => {
  return (
    <footer className="flex-shrink-0 sw-full border-t pb-8">
      <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 py-3 px-6">
        <p className="text-xs text-muted-foreground">
          Copyright &copy; {new Date().getFullYear()} Oasis Protocol Foundation
          2025
        </p>
        <div className="flex gap-4">
          <span className="text-xs text-muted-foreground">
            Version {APP_VERSION}
          </span>
          <span className="text-xs text-muted-foreground">|</span>
          <a
            href="https://oasis.net/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};
