import { FC } from 'react'
import { ExternalLink as ExternalLinkIcon } from 'lucide-react'

import { EXPLORER_URL } from '../../constants/global'

type ExplorerAccountLinkProps = {
  address: string
  network: 'mainnet' | 'testnet'
}

export const ExplorerAccountLink: FC<ExplorerAccountLinkProps> = ({ address, network }) => {
  return (
    <a
      href={`${EXPLORER_URL}${network}/sapphire/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary inline-flex items-center gap-2 mr-2"
    >
      {address}
      <ExternalLinkIcon className="h-4 w-4" />
    </a>
  )
}
