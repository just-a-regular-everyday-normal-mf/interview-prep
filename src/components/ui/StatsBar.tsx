'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { BookOpen, Layers, Sparkles } from 'lucide-react'

type Stat = { label: string; value: number; suffix?: string; icon: typeof BookOpen }

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1400
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * value)
      setDisplay(start)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  )
}

export default function StatsBar({ topics, questions, features }: { topics: number; questions: number; features: number }) {
  const stats: Stat[] = [
    { label: 'Questions', value: questions, suffix: '+', icon: BookOpen },
    { label: 'Topics', value: topics, icon: Layers },
    { label: 'Features', value: features, icon: Sparkles },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative z-10 max-w-4xl mx-auto px-4 -mt-8"
    >
      <div className="card-premium rounded-2xl p-1">
        <div className="grid grid-cols-3 divide-x divide-[var(--border)] rounded-xl overflow-hidden">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex flex-col items-center gap-2 py-6 px-4 bg-[var(--bg-card)]/60"
            >
              <stat.icon size={18} className="text-violet-400" />
              <div className="text-3xl sm:text-4xl font-black gradient-text">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
