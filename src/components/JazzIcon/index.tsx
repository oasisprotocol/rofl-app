import jazzicon from '@metamask/jazzicon'
import { memo, useEffect, useRef } from 'react'

interface JazzIconProps {
  diameter: number
  seed: number
}

export const JazzIcon = memo(({ diameter, seed }: JazzIconProps) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref?.current) {
      const icon = jazzicon(diameter, seed)

      ref.current.replaceChildren(icon)
    }
  }, [diameter, seed])

  return <span ref={ref} style={{ lineHeight: 0 }}></span>
})
