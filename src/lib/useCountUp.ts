'use client'
import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration = 1400, enabled = true) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!enabled || started.current) return
    started.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, enabled])

  return value
}
