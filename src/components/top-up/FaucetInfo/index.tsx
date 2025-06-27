import type { FC } from 'react'
import { Card } from '@oasisprotocol/ui-library/src/components/ui/card.tsx'
import { ExternalLink } from 'lucide-react'
import { FAUCET_URL } from '../../../constants/top-up-config.ts'

export const FaucetInfo: FC = () => {
  return (
    <Card className="w-[400px] p-6 space-y-4 mb-4">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Need $TEST Tokens?</h3>
        <p className="text-sm text-muted-foreground">
          You're currently on the testnet. If you need test tokens to get started, you can use the faucet to
          top up your wallet.
        </p>
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <ExternalLink className="h-4 w-4" />
          Open Testnet Faucet
        </a>
      </div>
    </Card>
  )
}
