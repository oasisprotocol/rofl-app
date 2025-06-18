import type { FC } from 'react';
import { CardWrapper } from '../../components/Card/index';
import dashboardImage from './images/dashboard.png';

export const Cards: FC = () => {
  return (
    <div className="p-6 md:p-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CardWrapper
          title="Templates"
          description="Tincidunt ut bibendum tempus integer nec eget commodo. Nisi eleifend phasellus vitae in diam laoreet urna molestie tortor. Facilisi sit fringilla ultricies nisi semper rhoncus egestas."
        />
        <CardWrapper
          title="Providers"
          description="Tincidunt ut bibendum tempus integer nec eget commodo. Nisi eleifend phasellus vitae in diam laoreet urna molestie tortor. Facilisi sit fringilla ultricies nisi semper rhoncus egestas."
        />
      </div>
      <CardWrapper
        title="Explore"
        description="Egestas eu praesent mauris feugiat tellus tempus sem quis. Sodales lacus elit turpis nullam enim condimentum non. Est commodo nec diam sapien aenean. Nullam dui ut enim ut purus augue integer tempor. Nam dictum nunc auctor ornare nec enim eget urna."
        to="/explore"
        image={dashboardImage}
      />
    </div>
  );
};
