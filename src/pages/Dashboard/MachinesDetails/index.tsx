import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oasisprotocol/ui-library/src/components/ui/tabs';
import { Clock, CircleStop, RotateCcw, CircleArrowUp } from 'lucide-react';
import { MachineStatusIcon } from '../../../components/MachineStatusIcon';
import { MachineDetailsRow } from './MachineDetailsRow';

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
              <Button variant="outline" className="w-full md:w-auto">
                <CircleArrowUp />
                Top up
              </Button>
              <Button variant="outline" className="w-full md:w-auto md:ml-8">
                <RotateCcw />
                Restart
              </Button>
              <Button variant="outline" className="w-full md:w-auto md:mr-8">
                <CircleStop />
                Stop
              </Button>
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="details">
            <div className="space-y-4">
              <MachineDetailsRow label="App Running" className=" py-6 border-b">
                <Link to="/dashboard/apps" className="text-primary">
                  WT3
                </Link>
              </MachineDetailsRow>
              <MachineDetailsRow label="Provider">OPF</MachineDetailsRow>
              <MachineDetailsRow label="Machine Size">
                Small (1CPU, 2GB RAM, 10GB Storage)
              </MachineDetailsRow>
              <MachineDetailsRow label="Node ID" className="pb-6 border-b">
                <a
                  href="https://explorer.oasis.io/sapphire/rofl/node/0x4d3f5b2d3rP7lUVU2BSfSm53opnGui"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary"
                >
                  oasis13Gmsfb2D3rP7lUVU2BSfSm53opnGui
                </a>
              </MachineDetailsRow>
            </div>
          </TabsContent>
          <TabsContent value="logs">logs</TabsContent>
        </Tabs>
      </div>
    </>
  );
};
