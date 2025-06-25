import { type FC } from 'react'
import { JazzIcon } from '../JazzIcon'
import { addressToJazzIconSeed } from '../JazzIcon/addressToJazzIconSeed'

type AccountAvatarProps = {
  diameter: number
  account:
    | { address: `oasis1${string}`; address_eth?: `0x${string}` }
    | { address?: `oasis1${string}`; address_eth: `0x${string}` }
}

export const AccountAvatar: FC<AccountAvatarProps> = ({ account, diameter }) => {
  if (!account.address && !account.address_eth) {
    return null
  }

  return <JazzIcon diameter={diameter} seed={addressToJazzIconSeed(account)} />
}
