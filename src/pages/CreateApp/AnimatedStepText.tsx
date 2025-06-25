import { type FC, useEffect, useState } from 'react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'
import { Link } from 'react-router-dom'

type BootstrapState = 'create_and_deploy' | 'artifacts' | 'success' | 'error'

const textContent = {
  create_and_deploy: {
    header: 'Creating and deploying ROFL app',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum imperdiet erat in enim volutpat facilisis at quis sapien.',
  },
  artifacts: {
    header: 'Building artifacts',
    description:
      'Nulla pretium dictum metus, in fringilla arcu tincidunt ut. Duis eget turpis at magna tempor interdum at ac ante.',
  },
  success: {
    header: 'ROFL App is ready',
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
}

type AnimatedStepTextProps = {
  bootstrapStep: BootstrapState
}

export const AnimatedStepText: FC<AnimatedStepTextProps> = ({ bootstrapStep }) => {
  const [isVisible, setIsVisible] = useState(false)
  const content = textContent[bootstrapStep]

  useEffect(() => {
    setIsVisible(false)

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200)

    return () => clearTimeout(timer)
  }, [bootstrapStep])

  return (
    <div className="mb-8">
      <h1
        key={`header-${bootstrapStep}`}
        className={`text-2xl font-white font-bold mb-2 text-center transition-all duration-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        {content.header}
      </h1>
      <div
        key={`description-${bootstrapStep}`}
        className={`text-muted-foreground text-md max-w-md text-center transition-all duration-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {content.description}
      </div>
    </div>
  )
}
