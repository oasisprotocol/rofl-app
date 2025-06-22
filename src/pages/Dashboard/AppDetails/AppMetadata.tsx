import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { DetailsSectionRow } from '../../../components/DetailsSectionRow';
import {
  useGetRuntimeRoflAppsIdTransactions,
  type RoflAppPolicy,
} from '../../../nexus/api';
import { useNetwork } from '../../../hooks/useNetwork';
import { isUrlSafe } from '../../../utils/url';
import { trimLongString } from '../../../utils/trimLongString';
import { MetadataDialog } from './MetadataDialog';
import { type ViewMetadataState } from './types';
import { type MetadataFormData } from '../../CreateApp/types';

type AppMetadataProps = {
  id: string;
  editableState: MetadataFormData;
  policy: RoflAppPolicy;
  setViewMetadataState: (state: ViewMetadataState) => void;
};

export const AppMetadata: FC<AppMetadataProps> = ({
  id,
  editableState,
  policy,
  setViewMetadataState,
}) => {
  const network = useNetwork();
  const { data } = useGetRuntimeRoflAppsIdTransactions(
    network,
    'sapphire',
    id,
    {
      limit: 1,
      method: 'rofl.Update',
    }
  );
  const transaction = data?.data.transactions[0];

  return (
    <div className="space-y-4">
      <DetailsSectionRow label="Machine(s)">
        <Link to="/dashboard/machines" className="text-primary">
          OPF-1
        </Link>
      </DetailsSectionRow>
      <DetailsSectionRow label="Minimum resources" className=" pb-6 border-b">
        1CPU, 2GB RAM, 10GB Storage
      </DetailsSectionRow>
      <DetailsSectionRow label="Explorer Link" className="pb-6 border-b">
        <a
          href={`https://explorer.oasis.io/${network}/sapphire/rofl/app/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary"
        >
          {id}
        </a>
      </DetailsSectionRow>
      <MetadataDialog
        metadata={editableState}
        setViewMetadataState={setViewMetadataState}
      />
      <DetailsSectionRow label="Author">
        <>{editableState.author}</>
      </DetailsSectionRow>
      <DetailsSectionRow label="Description">
        <>{editableState.description}</>
      </DetailsSectionRow>
      <DetailsSectionRow label="Version">
        <>{editableState.version}</>
      </DetailsSectionRow>
      <DetailsSectionRow label="Homepage">
        {isUrlSafe(editableState.homepage) ? (
          <a
            href={editableState.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            {editableState.homepage}
          </a>
        ) : undefined}
      </DetailsSectionRow>
      <DetailsSectionRow label="License" className=" pb-6 border-b">
        <>{editableState.license}</>
      </DetailsSectionRow>
      <div className="text-xl font-bold">Policy</div>
      <DetailsSectionRow label="Who can run this app">
        <Endorsements endorsements={policy.endorsements} />
      </DetailsSectionRow>
      <DetailsSectionRow label="Latest Update" className=" pb-6 border-b">
        {transaction && (
          <>
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date(transaction?.timestamp))}
            <br />
            <a
              href={`https://explorer.oasis.io/mainnet/sapphire/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              {trimLongString(transaction.eth_hash || transaction.hash)}
            </a>
          </>
        )}
      </DetailsSectionRow>
    </div>
  );
};

const Endorsements = ({ endorsements }: { endorsements: unknown }) => {
  const items = endorsements as Array<{ node?: string; any?: boolean }>;

  if (items.some((item) => 'node' in item)) {
    return (
      <>
        {items.map((item) => (
          <div key={item.node}>{item.node}</div>
        ))}
      </>
    );
  }

  if (items.length === 1 && 'any' in items[0]) {
    return <>Any</>;
  }

  return <></>;
};
