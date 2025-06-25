import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ className }) => {
  return <Loader2 className={`animate-spin ${className || ''}`} />
}
