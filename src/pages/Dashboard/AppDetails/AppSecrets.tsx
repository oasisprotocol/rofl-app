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
import { type RoflAppSecrets } from '../../../nexus/api'
import { RemoveSecret } from './RemoveSecret'
import { SecretDialog } from './SecretDialog'
import { type ViewSecretsState } from './types'

type AppSecretsProps = {
  secrets: RoflAppSecrets
  setViewSecretsState: (state: ViewSecretsState) => void
  editEnabled?: boolean
}

export const AppSecrets: FC<AppSecretsProps> = ({ secrets, setViewSecretsState, editEnabled }) => {
  const hasSecrets = Object.keys(secrets).length > 0

  function handleRemoveSecret(secret: string) {
    const updatedSecrets = { ...secrets }
    delete updatedSecrets[secret]
    setViewSecretsState({
      isDirty: true,
      secrets: updatedSecrets,
    })
  }

  function handleEditSecret(name: string, value: string) {
    const updatedSecrets = { ...secrets, [name]: value }
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
                  <SecretDialog mode="edit" secret={key} handleEditSecret={handleEditSecret} />
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
