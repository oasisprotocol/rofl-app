import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { FC } from 'react';

export const Hero: FC = () => {
  return (
    <section className="p-6 md:p-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Offchain Performance.
              <br />
              Onchain Trust.
            </h1>
            <p className="text-md text-muted-foreground max-w-lg leading-relaxed">
              Build next-gen applications with Runtime Offchain Logic, a
              framework that allows dApps to run in a verifiable, decentralized,
              and private way.
            </p>
          </div>
          <Button size="lg">
            Get started
            <ArrowRight />
          </Button>
        </div>

        <div className="relative h-96 lg:h-[400px]">
          {/* Image placeholder */}
        </div>
      </div>
    </section>
  );
};
