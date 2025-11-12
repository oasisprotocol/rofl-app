import type { FC } from 'react'
import { Card } from '@oasisprotocol/ui-library/src/components/ui/card.tsx'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { ROSE_APP_URL } from '../../../constants/global.ts'

export const TopUpInitializationFailed: FC = () => {
  return (
    <Card className="w-[400px] p-6 space-y-4 mb-4 border-destructive/50 bg-destructive/5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Top-up Not Available</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          The wallet top-up functionality is currently not available. You can still use the ROSE App, to help
          you transfer $ROSE to your Sapphire account.
        </p>
        <a
          href={ROSE_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <ExternalLink className="h-4 w-4" />
          Open ROSE App
        </a>
      </div>
    </Card>
  )
}
