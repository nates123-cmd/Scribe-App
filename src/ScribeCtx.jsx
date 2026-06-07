import { createContext, useContext } from 'react'

// App-wide context: theme, route, and navigation. `t` (the token var-map) is
// static — theming happens through CSS variables, not by swapping `t`.
export const ScribeCtx = createContext(null)

export function useScribe() {
  return useContext(ScribeCtx)
}

// One breakpoint, matchMedia — drives the desktop/mobile split. Mobile layout
// is a later pass (see BUILD.md / handoff "Responsive / Out of Scope").
import { useEffect, useState } from 'react'
export function useIsMobile(bp = 760) {
  const q = `(max-width:${bp}px)`
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}
