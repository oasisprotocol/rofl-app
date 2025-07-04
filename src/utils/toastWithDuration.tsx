import { CSSProperties } from 'react'
import { toast } from 'sonner'

/** Shows animated progressbar until disappearing */
export function toastWithDuration(message: string, duration: number) {
  toast(
    <div style={{ '--animate-dashoffset-duration': duration + 'ms' } as CSSProperties}>
      {message}
      <svg className="absolute left-0 w-full h-6" viewBox="0 0 100 4" xmlns="http://www.w3.org/2000/svg">
        <line
          x1="1"
          y1="2"
          x2="99"
          y2="2"
          fill="none"
          className="stroke-current text-muted animate-dashoffset-reverse"
          strokeWidth="2"
          strokeLinecap="round"
        ></line>
      </svg>
    </div>,
    { duration: duration },
  )
}
