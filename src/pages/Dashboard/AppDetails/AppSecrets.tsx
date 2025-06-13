import { type FC } from 'react';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@oasisprotocol/ui-library/src/components/ui/table';
import { LockKeyhole, SquarePen, Trash2 } from 'lucide-react';
import type { RoflAppSecrets } from '../../../nexus/api';
import { RemoveSecret } from './RemoveSecret';

type AppSecretsProps = {
  secrets: RoflAppSecrets;
};

export const AppSecrets: FC<AppSecretsProps> = ({ secrets }) => {
  return (
    <div className="space-y-4">
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
          {Object.keys(secrets).map((key) => (
            <TableRow key={key}>
              <TableCell>
                <LockKeyhole size={16} className="font-white" />
              </TableCell>
              <TableCell>
                {key}: [{(secrets[key] as string).length} bytes]
              </TableCell>
              <TableCell className="w-10">
                <Button variant="ghost">
                  <SquarePen />
                </Button>
              </TableCell>
              <TableCell className="w-10">
                <RemoveSecret secret={key} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
