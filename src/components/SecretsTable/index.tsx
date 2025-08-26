import { type FC } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@oasisprotocol/ui-library/src/components/ui/table'
import { RoflApp, type RoflAppSecrets } from '../../nexus/api'
import { RemoveSecret } from './RemoveSecret'
import { SecretDialog } from './SecretDialog'
import * as oasis from '@oasisprotocol/client'
import * as oasisRT from '@oasisprotocol/client-rt'

type SecretsTableProps = {
  appSek: RoflApp['sek']
  secrets: RoflAppSecrets
  setViewSecretsState: (state: { isDirty: boolean; secrets: RoflAppSecrets }) => void
  editEnabled?: boolean
}

export const SecretsTable: FC<SecretsTableProps> = ({
  appSek,
  secrets,
  setViewSecretsState,
  editEnabled,
}) => {
  const hasSecrets = Object.keys(secrets).length > 0

  function handleRemoveSecret(secret: string) {
    const updatedSecrets = { ...secrets }
    delete updatedSecrets[secret]
    setViewSecretsState({
      isDirty: true,
      secrets: updatedSecrets,
    })
  }

  function handleEditSecret(key: string, value: string) {
    const secretValue = oasisRT.rofl.encryptSecret(
      key,
      oasis.misc.fromString(value),
      oasis.misc.fromBase64(appSek),
    )
    const updatedSecrets = { ...secrets, [key]: secretValue }
    setViewSecretsState({
      isDirty: true,
      secrets: updatedSecrets,
    })
  }

  return (
    <div className="space-y-4">
      {hasSecrets && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">
                <span className="text-muted-foreground">Name</span>
              </TableHead>
              <TableHead className="w-[45%]">
                <span className="text-muted-foreground">Value</span>
              </TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(secrets).map(key => (
              <TableRow key={key}>
                <TableCell>
                  {key}: [{(secrets[key] as string).length} bytes]
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">Encrypted</span>
                </TableCell>
                <TableCell className="w-10">
                  <SecretDialog
                    mode="edit"
                    secret={key}
                    editEnabled={editEnabled}
                    handleEditSecret={handleEditSecret}
                  />
                </TableCell>
                <TableCell className="w-10">
                  <RemoveSecret
                    editEnabled={editEnabled}
                    secret={key}
                    handleRemoveSecret={handleRemoveSecret}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <SecretDialog mode="add" handleAddSecret={handleEditSecret} editEnabled={editEnabled} />
    </div>
  )
}
