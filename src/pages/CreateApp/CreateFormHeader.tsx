import { type FC } from 'react';

type CreateFormHeaderProps = {
  title: string;
  description: string;
};

export const CreateFormHeader: FC<CreateFormHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <div>
      <h1 className="text-2xl font-white font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground text-sm max-w-md">{description}</p>
    </div>
  );
};
