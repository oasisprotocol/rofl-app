import { type FC } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@oasisprotocol/ui-library/src/components/ui/table'
import { LockKeyhole } from 'lucide-react'
import { RoflApp, type RoflAppSecrets } from '../../../nexus/api'
import { RemoveSecret } from './RemoveSecret'
import { SecretDialog } from './SecretDialog'
import { type ViewSecretsState } from './types'
import * as oasis from '@oasisprotocol/client'
import * as oasisRT from '@oasisprotocol/client-rt'

type AppSecretsProps = {
  appSek: RoflApp['sek']
  secrets: RoflAppSecrets
  setViewSecretsState: (state: ViewSecretsState) => void
  editEnabled?: boolean
}

export const AppSecrets: FC<AppSecretsProps> = ({ appSek, secrets, setViewSecretsState, editEnabled }) => {
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
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(secrets).map(key => (
              <TableRow key={key}>
                <TableCell>
                  <LockKeyhole size={16} className="font-white" />
                </TableCell>
                <TableCell>
                  {key}: [{(secrets[key] as string).length} bytes]
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
