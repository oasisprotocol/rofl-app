import { FC, Fragment, PropsWithChildren, ReactNode } from 'react'
import { getOasisAddressFromBase64PublicKey } from '../../../utils/helpers'
import { ExplorerAccountLink } from '../../../components/ExplorerAccountLink'
import { exhaustedTypeWarning } from '../../../components/ErrorBoundary/errors'
import { useNetwork } from '../../../hooks/useNetwork'

const EndorsementDetail: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-nowrap md:flex-wrap gap-1 items-center flex-1 overflow-x-hidden overflow-y-hidden text-nowrap md:whitespace-normal">
      {children}
    </div>
  )
}

type RoflAllowedEndorsementFields =
  | 'any'
  | 'role_compute'
  | 'role_observer'
  | 'entity'
  | 'node'
  | 'provider'
  | 'provider_instance_admin'
  | 'and'
  | 'or'

export type EndorsementRecord = { [key: string]: unknown }

type EndorsementProps = {
  endorsements: EndorsementRecord[]
  groupOp?: 'and' | 'or'
}

export const Endorsement: FC<EndorsementProps> = ({ endorsements, groupOp = 'or' }) => {
  const network = useNetwork()

  if (!Array.isArray(endorsements) || endorsements.length === 0) {
    return null
  }

  // Nexus is not parsing ROFL app policy, but we can expect object to be similar to this:
  // https://github.com/oasisprotocol/oasis-sdk/blob/3f1f6f4aa4a7800b1c176fea3cbb2faaba915ddb/runtime-sdk/src/modules/rofl/policy.rs#L91

  const getEndorsementExplanation = (key: RoflAllowedEndorsementFields, value: unknown): ReactNode => {
    switch (key) {
      case 'any':
        return <EndorsementDetail>Any node can endorse the enclave</EndorsementDetail>
      case 'role_compute':
        return (
          <EndorsementDetail>
            Node has the <i>compute</i> role for the current runtime
          </EndorsementDetail>
        )
      case 'role_observer':
        return (
          <EndorsementDetail>
            Node has the <i>observer</i> role for the current runtime
          </EndorsementDetail>
        )
      case 'provider_instance_admin':
        return (
          <EndorsementDetail>
            <ExplorerAccountLink address={value as string} network={network} /> is currently admin on machine
          </EndorsementDetail>
        )
      case 'provider':
        return (
          <EndorsementDetail>
            Node from provider <ExplorerAccountLink address={value as string} network={network} />
          </EndorsementDetail>
        )
      case 'node':
        return (
          <EndorsementDetail>
            Node{' '}
            <ExplorerAccountLink
              address={getOasisAddressFromBase64PublicKey(value as string)}
              network={network}
            />
          </EndorsementDetail>
        )
      case 'entity':
        return (
          <EndorsementDetail>
            Node from entity{' '}
            <ExplorerAccountLink
              address={getOasisAddressFromBase64PublicKey(value as string)}
              network={network}
            />
          </EndorsementDetail>
        )
      case 'and':
      case 'or':
        return (
          <div className="flex-1 flex flex-col overflow-x-hidden pl-4 border-l border-border rounded-tl-lg rounded-bl-lg">
            <Endorsement endorsements={value as EndorsementRecord[]} groupOp={key} />
          </div>
        )
    }
    exhaustedTypeWarning('Unknown endorsement', key)
  }

  return (
    <>
      {endorsements.map((endorsement: EndorsementRecord, index: number) => {
        const keys = Object.keys(endorsement)
        if (keys.length === 0) return null
        const key = keys[0] as RoflAllowedEndorsementFields
        const value = endorsement[key]
        const renderedExplanation = getEndorsementExplanation(key, value)

        if (endorsements.length === 1) {
          return <Fragment key={index}>{renderedExplanation}</Fragment>
        }

        return (
          <Fragment key={index}>
            {index > 0 && <span className="whitespace-nowrap font-bold">{groupOp}</span>}
            <div className="flex flex-1 items-center flex-nowrap overflow-x-hidden gap-2">
              {renderedExplanation}
            </div>
          </Fragment>
        )
      })}
    </>
  )
}
