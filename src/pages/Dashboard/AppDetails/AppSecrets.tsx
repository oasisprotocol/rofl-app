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

const secrets: RoflAppSecrets = {
  AGE_PRIVATE_KEY:
    'pGJwa1gg3eUzqhDGI/qi8m1iC9Zd4BCBhMku5igt2l1QWdYnxnBkbmFtZVgfrvCjJV+R2RSctaOev10Tg5tXrUyfylC21sQIoSoUumVub25jZU9/mpZTAhh7qbVgRZRMsT1ldmFsdWVYWjmozrW+cSX+yooX73jT/Zr2c49jglDin4akg/4JLYnCIq8UoI2xiSehv/cTWZt19z06u6iw4+vWGXhjkH806OGCHzI2J2g6o+KssZBn2kdOmcmZXz9qsg3lwg==',
  GROK_API_KEY:
    'pGJwa1ggD/yScHMz1wyPVOhJJ6nw7wmIZfLjotR8jqigdoUXlxhkbmFtZVgcFURoQyEiijo1pq2hxxUZc9U2uYkBEf0jCdsJJWVub25jZU/vU7wd32uHktz4103/OiBldmFsdWVYZPGbOJYQHwI6za/tbKX3siMoATANVGrfheEjlJhfs5RzlHlqFWOaxm27nyhpou0ZHryaQYavCGeXXQB/p1dYSY9xcMLrkAaJqHf0LO5a+07WpLifgvW3L0331jVrd/tJlVMfMrI=',
  SIGNAL_SERVICE_URL:
    'pGJwa1ggShZPFJb0rWeJLn0GdYakAF13nCg8JgKqCBKRmGcl/TRkbmFtZVgi6ey3kSR5XVzigb4Qb6+a/gETDueOV5iOcsz+7mlRMLwEomVub25jZU+Smd/fPIaMXW9j8xB9241ldmFsdWVYKjn85TOhV+gypVs/JjRe5D+uKEEkT78DxDZJC/HTAbmU+JitLrhTaJ0G2w==',
  TWITTER_ACCESS_TOKEN:
    'pGJwa1ggY0nR5E4japG98L8aVwsauhONUjHMfRNsPaJtW0eUHgJkbmFtZVgk5AF3vPFvrjLpS+SdHkv3RgsjXBeWlq8umS12YP0ChoZQWpPPZW5vbmNlTzKd1aV8vZzRHn+OTSICO2V2YWx1ZVhCh+7QaJjHX49LOiO8wsCBdbpE1EJWt5h5svSAPNioFrd/3YRV9wHb1pV/wrWXip99xk7uuIHuC74lXbdmA92Twk6i',
  TWITTER_ACCESS_TOKEN_SECRET:
    'pGJwa1ggpsWvkJn5aky00I0qxDGv1QxI2vaS7uT217tK3I+KECFkbmFtZVgrGAfce0Tam7SkZokW2inl2eeIf3DlM7ZL6Bh1kLrQplPyUwuXSRougo51IGVub25jZU+AA/ZJVBTL92MokujGQ1pldmFsdWVYPXv+BUQ+JkPfv7dKfur4nbTusXEJkWddK3ZCGTxeWFK8zM37YTht+XxVZaV8QT8oXTDSv+8S8dRaCeWTGog=',
  TWITTER_API_KEY:
    'pGJwa1ggswM0skHfn7xKgymkS+TD+v5OLE2MxvBi7SxjDJFfUkhkbmFtZVgfGj4ue+QdVad/aUy54WQ9TLvdOjlQ4XwW6hcCQqfPeWVub25jZU/RM8guxd1Dt/Thp4xrirNldmFsdWVYKcn1FQKk6Qv/ZMeFXfHz9SjyJ4q6ROMX1MQ4Je89kji3IY8m54kKMGtQ',
};

export const AppSecrets: FC = () => {
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
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
