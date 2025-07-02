import { CSSProperties, type FC, useEffect, useState } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Link } from 'react-router-dom'
import { CheckCircle, TriangleAlert } from 'lucide-react'
import { useCreateAndDeployApp } from '../../backend/api'
import { cn } from '@oasisprotocol/ui-library/src/lib/utils'

type Step = ReturnType<typeof useCreateAndDeployApp>['progress']['currentStep'] | 'success' | 'error'

const textContent = {
  creating: {
    header: 'Creating app...',
    description: '',
  },
  building: {
    header: 'Building app...',
    description: '',
  },
  updating: {
    header: 'Updating app secrets...',
    description: '',
  },
  deploying: {
    header: 'Deploying app to machine...',
    description: '',
  },
  success: {
    header: 'App will be ready in 5 minutes!',
    description: (
      <>
        <div>
          Sed imperdiet libero sed arcu iaculis, et congue eros rhoncus. Donec lacinia a ante eu imperdiet.
          Sed nisi elit, hendrerit ut est nec, pharetra euismod odio.
        </div>
        <Button asChild className="mt-4">
          <Link to={'/dashboard'}>Navigate to Dashboard</Link>
        </Button>
      </>
    ),
  },
  error: {
    header: 'Error creating ROFL app',
    description: 'An error occurred while creating the ROFL app. Please try again later.',
  },
} satisfies Record<Step, unknown>

type AnimatedStepTextProps = {
  step: Step
}

export const AnimatedStepText: FC<AnimatedStepTextProps> = ({ step }) => {
  const [isVisible, setIsVisible] = useState(false)
  const content = textContent[step]

  useEffect(() => {
    setIsVisible(false)

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [step])

  return (
    <div className="mb-8">
      <h1
        key={`header-${step}`}
        className={`text-2xl font-white font-bold mb-2 text-center transition-all duration-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        {content.header}
      </h1>
      <div
        key={`description-${step}`}
        className={`text-muted-foreground text-md max-w-md text-center transition-all duration-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {content.description}
      </div>
    </div>
  )
}

export const HeaderSteps: FC<{
  progress: ReturnType<typeof useCreateAndDeployApp>['progress']
  bootstrapStep: 'create_and_deploy' | 'success' | 'error'
}> = ({ progress, bootstrapStep }) => {
  const { steps, currentStep, stepEstimatedDurations, stepLabels } = progress
  return (
    <div className="flex flex-col md:flex-row w-full">
      {steps.map((step, i) => (
        <div key={step} className="flex flex-1 items-center gap-3 px-6 py-4 border-b border-border">
          {steps.indexOf(currentStep!) > i || bootstrapStep === 'success' ? (
            <CheckCircle className="h-6 w-6 text-success" />
          ) : currentStep === step && bootstrapStep === 'error' ? (
            <TriangleAlert className="h-6 w-6 text-error" />
          ) : (
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full transition bg-muted',
                currentStep === step && 'bg-primary',
              )}
            >
              {currentStep === step && stepEstimatedDurations[step] && (
                <div
                  className="absolute size-8"
                  style={
                    { '--animate-dashoffset-duration': stepEstimatedDurations[step] + 'ms' } as CSSProperties
                  }
                >
                  <svg
                    className="size-full -rotate-90"
                    viewBox="0 0 36 36"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-current text-primary animate-dashoffset"
                      strokeWidth="2"
                      strokeLinecap="round"
                    ></circle>
                  </svg>
                </div>
              )}
              <span className="text-xs font-semibold text-primary-foreground">{i + 1}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-muted-foreground">{stepLabels[step]}</span>
        </div>
      ))}
    </div>
  )
}
