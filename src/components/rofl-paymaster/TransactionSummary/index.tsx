import { FC } from 'react'
import { useGasPrice } from 'wagmi'
import { FormatUtils } from '../../../utils/format.utils.ts'
import {
  ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT,
  ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN,
  ROFL_PAYMASTER_EXPECTED_TIME,
} from '../../../constants/rofl-paymaster-config.ts'
import { NumberUtils } from '../../../utils/number.utils.ts'
import { Chain } from 'viem'

interface Props {
  quote: bigint | null
  selectedChain?: Chain
  isLoading?: boolean
}

export const TransactionSummary: FC<Props> = ({ quote, isLoading, selectedChain }) => {
  const { data: gasPrice, isLoading: isLoadingGasPrice } = useGasPrice({
    chainId: selectedChain?.id,
  })
  const nativeCurrency = selectedChain?.nativeCurrency

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start w-full">
        <span className="text-xs text-muted-foreground">Bridge Fee</span>
        <span className="text-xs text-card-foreground">
          {FormatUtils.formatLoadingState(
            isLoading || isLoadingGasPrice,
            !quote ? '-/-' : `0 ${ROFL_PAYMASTER_DESTINATION_CHAIN_TOKEN.symbol}`,
          )}
        </span>
      </div>
      {gasPrice && (
        <div className="flex justify-between items-start w-full">
          <span className="text-xs text-muted-foreground">Gas Fee</span>
          <span className="text-xs text-card-foreground">
            {FormatUtils.formatLoadingState(
              isLoading || isLoadingGasPrice,
              !quote
                ? '-/-'
                : NumberUtils.formatGasFeeWithSymbol(
                    ROFL_PAYMASTER_DEPOSIT_GAS_LIMIT.toString(),
                    gasPrice!,
                    nativeCurrency?.symbol,
                    nativeCurrency?.decimals,
                    8,
                  ),
            )}
          </span>
        </div>
      )}
      <div className="flex justify-between items-start w-full">
        <span className="text-xs text-muted-foreground">Est. Time</span>
        <span className="text-xs text-card-foreground">
          {FormatUtils.formatLoadingState(
            isLoading,
            !quote ? '-/-' : FormatUtils.formatTime(ROFL_PAYMASTER_EXPECTED_TIME),
          )}
        </span>
      </div>
    </div>
  )
}
