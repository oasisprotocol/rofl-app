import { type FC, useEffect, useState } from 'react';
import { Layout } from '@oasisprotocol/ui-library/src/components/ui/layout';
import { Header } from '../../components/Layout/Header';
import { Footer } from '../../components/Layout/Footer';
import Bootstrap from './images/bootstrap.png';
import type { AppData } from './types';
import { stringify } from 'yaml';

type BootstrapStepProps = {
  appData?: AppData;
  template: any;
};

const textContent = [
  {
    header: 'Building artifacts',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum imperdiet erat in enim volutpat facilisis at quis sapien.',
  },
  {
    header: 'Deploying ROFL app',
    description:
      'Nulla pretium dictum metus, in fringilla arcu tincidunt ut. Duis eget turpis at magna tempor interdum at ac ante.',
  },
  {
    header: 'Submitting secrets',
    description:
      'Sed imperdiet libero sed arcu iaculis, et congue eros rhoncus.',
  },
  {
    header: 'ROFL App is ready',
    description:
      'Donec lacinia a ante eu imperdiet. Sed nisi elit, hendrerit ut est nec, pharetra euismod odio.',
  },
];

export const BootstrapStep: FC<BootstrapStepProps> = ({
  appData,
  template,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!appData || !template) {
    throw new Error('Missing data to bootstrap the app');
  }

  const rofl = template.templateParser(appData.metadata);
  const roflYaml = stringify(rofl);
  const composeYaml = template.yaml.compose;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= textContent.length - 1) {
            clearInterval(interval);
          }
          return Math.min(nextIndex, textContent.length - 1);
        });
        setIsVisible(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout headerContent={<Header />} footerContent={<Footer />}>
      <div className="w-full px-8 py-12 flex flex-col items-center justify-center">
        <img
          src={Bootstrap}
          alt="Bootstrap"
          className="w-[250px] h-auto mb-8"
        />
        <div className="mb-8">
          <h1
            className={`text-2xl font-white font-bold mb-2 text-center transition-all duration-800 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2'
            }`}
          >
            {textContent[currentIndex].header}
          </h1>
          <p
            className={`text-muted-foreground text-md max-w-md text-center transition-all duration-800 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
          >
            {textContent[currentIndex].description}
          </p>
        </div>
      </div>
    </Layout>
  );
};
