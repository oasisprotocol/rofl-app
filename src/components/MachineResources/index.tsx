import { type FC } from 'react';

export const ResourcesCpu: FC<{
  value: unknown;
}> = ({ value }) => {
  if (!value) return 'N/A';

  const cpuCount = Number(value);
  return `${cpuCount} CPU${cpuCount === 1 ? '' : 's'}`;
};

export const ResourcesMemory: FC<{
  value: unknown;
}> = ({ value }) => {
  if (!value) return 'N/A';

  const valueInMB = Number(value);
  const valueInGB = valueInMB / 1024;

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return `${formatter.format(valueInGB)} GB`;
};

export const ResourcesStorage: FC<{
  value: unknown;
}> = ({ value }) => {
  if (!value) return 'N/A';

  const storageInMB = Number(value);
  const storageInGB = Math.round(storageInMB / 1024);

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(storageInGB)} GB Storage`;
};

export const MachineResources: FC<{
  cpus?: unknown;
  memory?: unknown;
  storage?: unknown;
}> = ({ cpus, memory, storage }) => {
  return (
    <div className="flex flex-col gap-2">
      <ResourcesCpu value={cpus} />
      {', '}
      <ResourcesMemory value={memory} />
      {', '}
      <ResourcesStorage value={storage} />
    </div>
  );
};
