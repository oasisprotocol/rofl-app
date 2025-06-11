import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@oasisprotocol/ui-library/src/components/ui/card';
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@oasisprotocol/ui-library/src/lib/utils';

interface CardProps {
  title: string;
  description: string;
  buttonText?: string;
  image?: string;
}

export function CardWrapper({
  title,
  description,
  buttonText,
  image,
}: CardProps) {
  return (
    <Card
      className={cn(
        'bg-zinc-900 p-6 rounded-md relative overflow-hidden',
        image && 'min-h-[300px]'
      )}
    >
      <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
      <CardDescription className={cn('text-md', image && 'md:max-w-[50%]')}>
        {description}
      </CardDescription>
      <CardFooter className="p-0">
        <Button disabled={!buttonText} variant="secondary">
          {buttonText || 'Coming Soon'}
          {buttonText && <ArrowRight size={16} />}
        </Button>
      </CardFooter>
      {image && (
        <img
          src={image}
          alt={title}
          className="absolute md:-top-[40%] sm:-top-[20%] md:left-0 sm:left-[25%] w-full object-cover -rotate-13 origin-top-right md:scale-45 md:opacity-100 opacity-10"
        />
      )}
    </Card>
  );
}
