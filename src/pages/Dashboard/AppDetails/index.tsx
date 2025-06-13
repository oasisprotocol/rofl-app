import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/tabs';
import { AppStatusIcon } from '../../../components/AppStatusIcon';
import { DetailsSectionRow } from '../../../components/DetailsSectionRow';
import { SquarePen } from 'lucide-react';

export const AppDetails: FC = () => {
  return (
    <>
      <>
        <div>
          <Tabs defaultValue="details">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b py-5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">OPF-1</h1>
                <AppStatusIcon hasActiveInstances removed={false} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled
                  variant="destructive"
                  className="w-full md:w-auto md:ml-8"
                >
                  Discard
                </Button>
                <Button disabled className="w-full md:w-auto md:mr-8">
                  Apply
                </Button>
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="secrets">Secrets</TabsTrigger>
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="details">
              <div className="space-y-4">
                <DetailsSectionRow label="Machine(s)">
                  <Link to="/dashboard/machines" className="text-primary">
                    OPF-1
                  </Link>
                </DetailsSectionRow>
                <DetailsSectionRow
                  label="Minimum resources"
                  className=" pb-6 border-b"
                >
                  1CPU, 2GB RAM, 10GB Storage
                </DetailsSectionRow>
                <DetailsSectionRow
                  label="Explorer Link"
                  className="pb-6 border-b"
                >
                  <a
                    href="https://explorer.oasis.io/mainnet/sapphire/rofl/app/rofl1qpdzzm4h73gtes04xjn4whan84s3k33l5gx787l2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    rofl1qpdzzm4h73gtes04xjn4whan84s3k33l5gx787l2
                  </a>
                </DetailsSectionRow>
                <Button
                  disabled
                  variant="outline"
                  className="w-full md:w-auto md:ml-8 float-right"
                >
                  <SquarePen />
                  Edit
                </Button>
                <DetailsSectionRow label="Author">
                  <a
                    href="https://explorer.oasis.io/mainnet/sapphire/address/0x1441b57bD02E92473c89733D00881e859Eff6508"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    0x1441b57bD02E92473c89733D00881e859Eff6508
                  </a>
                </DetailsSectionRow>
                <DetailsSectionRow label="Description">
                  Ac vel nullam elit facilisis justo dictum non metus a. Dictum
                  quisque condimentum duis sit amet ac. Pharetra amet sed ornare
                  id nunc vivamus habitant enim in. Sed lorem scelerisque sed
                  purus eleifend diam.
                </DetailsSectionRow>
                <DetailsSectionRow label="Homepage">
                  <a
                    href="https://www.wt3.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    www.wt3.ai
                  </a>
                </DetailsSectionRow>
                <DetailsSectionRow label="Repository">
                  <a
                    href="https://github.com/oasisprotocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    https://github.com/oasisprotocol
                  </a>
                </DetailsSectionRow>
                <DetailsSectionRow label="License" className=" pb-6 border-b">
                  Apache-2.0
                </DetailsSectionRow>
                <div className="text-xl font-bold">Policy</div>
                <DetailsSectionRow label="Who can run this app">
                  Anyone
                </DetailsSectionRow>
                <DetailsSectionRow
                  label="Latest Update"
                  className=" pb-6 border-b"
                >
                  May 14, 2025
                </DetailsSectionRow>
              </div>
            </TabsContent>
            <TabsContent value="secrets">secrets</TabsContent>
            <TabsContent value="compose">compose</TabsContent>
          </Tabs>
        </div>
      </>
    </>
  );
};
