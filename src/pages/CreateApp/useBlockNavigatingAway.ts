import { useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'

let globalIsBlocking = false // If useBlockNavigatingAway gets destroyed, load state from this.

const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
  event.preventDefault()
  // Included for legacy support, e.g. Chrome/Edge < 119
  event.returnValue = true
}

export function useBlockNavigatingAway() {
  const [reactiveIsBlocking, setReactiveIsBlocking] = useState(globalIsBlocking)
  const reactRouterBlocker = useBlocker(() => reactiveIsBlocking) // Blocks soft navigation away
  // TODO can't have two blockers

  function blockNavigatingAway() {
    window.addEventListener('beforeunload', beforeUnloadHandler) // Blocks hard navigation away
    setReactiveIsBlocking(true)
    globalIsBlocking = true
  }

  function allowNavigatingAway() {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
    setReactiveIsBlocking(false)
    globalIsBlocking = false
  }

  useEffect(() => {
    if (reactRouterBlocker.state === 'blocked') {
      if (window.confirm('You are navigating away. Progress you made may not be saved.')) {
        reactRouterBlocker.proceed()
        allowNavigatingAway()
      } else {
        reactRouterBlocker.reset()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactRouterBlocker.state])

  return {
    isBlockingNavigatingAway: reactiveIsBlocking,
    blockNavigatingAway,
    allowNavigatingAway,
  }
}
