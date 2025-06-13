import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/tabs';
import { Clock, CircleArrowUp } from 'lucide-react';
import { MachineStatusIcon } from '../../../components/MachineStatusIcon';
import { DetailsSectionRow } from '../../../components/DetailsSectionRow';
import { MachineStop } from './MachineStop';
import { MachineRestart } from './MachineRestart';

export const MachinesDetails: FC = () => {
  return (
    <>
      <div>
        <Tabs defaultValue="details">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b py-5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">OPF-1</h1>
              <MachineStatusIcon removed={false} />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-orange-400 px-3 py-1.5 ">
                <Clock className="h-4 w-4" />
                <span>9h 34min</span>
              </div>
              <Button variant="outline" className="w-full md:w-auto" disabled>
                <CircleArrowUp />
                Top up
              </Button>
              <MachineRestart />
              <MachineStop />

              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="details">
            <div className="space-y-4">
              <DetailsSectionRow label="App Running" className=" py-6 border-b">
                <Link to="/dashboard/apps" className="text-primary">
                  WT3
                </Link>
              </DetailsSectionRow>
              <DetailsSectionRow label="Provider">OPF</DetailsSectionRow>
              <DetailsSectionRow label="Machine Size">
                Small (1CPU, 2GB RAM, 10GB Storage)
              </DetailsSectionRow>
              <DetailsSectionRow label="Node ID" className="pb-6 border-b">
                <a
                  href="https://explorer.oasis.io/sapphire/rofl/node/0x4d3f5b2d3rP7lUVU2BSfSm53opnGui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  oasis13Gmsfb2D3rP7lUVU2BSfSm53opnGui
                </a>
              </DetailsSectionRow>
            </div>
          </TabsContent>
          <TabsContent value="logs">
            <div className="whitespace-pre-wrap font-mono text-sm bg-card text-foreground mt-6 p-6 rounded-sm overflow-auto leading-relaxed">
              [2024-01-15 10:30:25] INFO: Application started
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
