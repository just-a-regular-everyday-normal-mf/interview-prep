'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type ReadingProgressProps = {
  color?: string
}

export default function ReadingProgress({ color = '#7c3aed' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3">
      <div className="relative w-1 h-48 rounded-full bg-[var(--border)] overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ background: `linear-gradient(to top, ${color}, ${color}88)` }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]"
          style={{ background: color, boxShadow: `0 0 12px ${color}80` }}
          animate={{ bottom: `calc(${progress}% - 6px)` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums">
        {Math.round(progress)}%
      </span>
    </div>
  )
}
