import { useState, type FC } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@oasisprotocol/ui-library/src/components/ui/table'
import { RoflApp, type RoflAppSecrets } from '../../nexus/api'
import { RemoveSecretDialog } from './RemoveSecretDialog'
import { SecretDialog } from './SecretDialog'
import * as oasis from '@oasisprotocol/client'
import * as oasisRT from '@oasisprotocol/client-rt'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@oasisprotocol/ui-library/src/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { AddSecret } from './AddSecret'

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
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false)
  const [selectedSecret, setSelectedSecret] = useState<string>('')
  const [secretDialogState, setSecretDialogState] = useState<{
    open: boolean
    mode: 'add' | 'edit'
    secretKey?: string
  }>({ open: false, mode: 'add' })

  const handleOpenRemoveDialog = (secretKey: string) => {
    setSelectedSecret(secretKey)
    setOpenRemoveDialog(true)
  }

  const handleOpenEditDialog = (key: string) => {
    setSecretDialogState({ open: true, mode: 'edit', secretKey: key })
  }

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
    <div className="space-y-4 gap-4 flex flex-col">
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
                <TableCell className="w-10" align="right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={!editEnabled}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEditDialog(key)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => handleOpenRemoveDialog(key)}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AddSecret disabled={!editEnabled} handleAddSecret={handleEditSecret} />

      <SecretDialog
        open={secretDialogState.open}
        mode={secretDialogState.mode}
        secret={secretDialogState.secretKey}
        onOpenChange={open => setSecretDialogState(prev => ({ ...prev, open }))}
        handleAddSecret={handleEditSecret}
        handleEditSecret={handleEditSecret}
        editEnabled={editEnabled}
      />

      <RemoveSecretDialog
        open={openRemoveDialog}
        handleRemoveSecret={handleRemoveSecret}
        onOpenChange={setOpenRemoveDialog}
        secret={selectedSecret}
      />
    </div>
  )
}
