import { useEffect, useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { ArrowRight } from 'lucide-react';
import HeroImage from './images/hero.svg';
import { cn } from '@oasisprotocol/ui-library/src/lib/utils';
import { SimpleRainbowKitConnectButton } from '../../components/RainbowKitConnectButton';
import { useAccount } from 'wagmi';

export const Hero: FC = () => {
  const { isConnected } = useAccount();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="px-6 md:px-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div
          className={cn(
            'space-y-4 text-center lg:text-left transition-all duration-1000 ease-out',
            {
              'opacity-100 translate-y-0': isLoaded,
              'opacity-0 translate-y-8': !isLoaded,
            }
          )}
        >
          <div className="pt-8 md-pt-0 space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Offchain Performance.
              <br />
              Onchain Trust.
            </h1>
            <p className="text-md text-muted-foreground lg:max-w-lg leading-relaxed">
              Build next-gen applications with Runtime Offchain Logic, a
              framework that allows dApps to run in a verifiable, decentralized,
              and private way.
            </p>
          </div>
          {isConnected ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Get started
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <SimpleRainbowKitConnectButton>
              Get started
              <ArrowRight />
            </SimpleRainbowKitConnectButton>
          )}
        </div>

        {/* -mb-[50px] can be removed once the image is properly cropped by designer */}
        <div
          className={cn(
            'border-t lg:border-0 -mb-[50px] relative h-70 md:h-96 lg:h-[450px] transition-all duration-1000 delay-500 ease-out',
            {
              'opacity-100 translate-x-0': isLoaded,
              'opacity-0 translate-x-8': !isLoaded,
            }
          )}
        >
          <div className="relative w-full h-full flex items-start justify-center">
            <img
              src={HeroImage}
              alt="ROFL App"
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
