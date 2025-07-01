import { Link, type To } from 'react-router-dom'
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@oasisprotocol/ui-library/src/components/ui/card'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'

interface CardProps {
  title: string
  description: string
  to?: To
  image?: string
  label?: string
}

export function CardWrapper({ title, description, to, image, label }: CardProps) {
  return (
    <Card className={cn('bg-zinc-900 p-6 rounded-md relative overflow-hidden', image && 'min-h-[300px]')}>
      <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
      <CardDescription className={cn('text-md', image && 'md:max-w-[50%]')}>{description}</CardDescription>
      <CardFooter className="p-0">
        {to ? (
          <Button disabled={!to} asChild className="z-1">
            <Link
              to={to}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {label}
              <ArrowRight size={16} />
            </Link>
          </Button>
        ) : (
          <Button disabled variant="secondary">
            Coming Soon
          </Button>
        )}
      </CardFooter>
      {image && (
        <img
          src={image}
          alt={title}
          className="absolute xl:-top-[25%] md:-top-[5%] sm:-top-[20%] xl:left-0 sm:left-[25%] w-full object-cover -rotate-13 origin-top-right md:scale-75 xl:scale-50 md:opacity-100 opacity-10"
        />
      )}
    </Card>
  )
}
