import { type FC } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { Card, CardContent } from '@oasisprotocol/ui-library/src/components/ui/card'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import OasisLogoBlue from '../icons/OasisLogoBlue.svg'
import { toast } from 'sonner'

const SURVEY_LINK = 'https://forms.gle/hiaMTdEZ43PM72QW7'

interface SurveyPopupProps {
  onClose: () => void
  isVisible: boolean
}

export const SurveyPopup: FC<SurveyPopupProps> = ({ onClose, isVisible }) => {
  // This is not the most reliable check, but simple enough opposed to hijacking the API, to count active toasts
  const hasActiveToasts = toast.getHistory().length > 0

  if (!isVisible || hasActiveToasts) return null

  return (
    <div className="fixed bottom-5 right-5 md:right-12.5 z-50 max-w-[calc(100vw-2.5rem)] md:max-w-none">
      <Card className="w-full md:w-[420px] rounded-xl bg-background border shadow-lg animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
        <CardContent className="flex flex-col gap-4 md:gap-6">
          <div className="flex justify-between items-start gap-4 md:gap-6 w-full">
            <div className="text-primary">
              <img src={OasisLogoBlue} alt="Oasis" className="h-6 md:h-auto" />
            </div>
            <button className="opacity-70 flex-shrink-0" onClick={onClose}>
              <X className="h-4 w-4 text-foreground" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl md:text-[30px] font-bold leading-tight md:leading-9 text-card-foreground">
              Help us improve ROFL 🚀
            </h2>
            <p className="text-sm font-normal leading-5 text-muted-foreground">
              Tell us what's working (and what's not). Your feedback makes a difference. Share your thoughts
              and help shape what's next.
            </p>
          </div>

          <Button className="w-full gap-2" asChild>
            <a href={SURVEY_LINK} rel="noopener noreferrer" target="_blank">
              Take the survey
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
