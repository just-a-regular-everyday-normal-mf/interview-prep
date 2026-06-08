'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

type TopicCardProps = {
  id: string
  title: string
  description: string
  icon: string
  color: string
  totalQ: number
  sectionCount: number
}

export default function TopicCard({ id, title, description, icon, color, totalQ, sectionCount }: TopicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)'
  }

  return (
    <Link href={`/topic/${id}`} className="block group">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="topic-card-3d card-premium rounded-2xl p-5 h-full transition-transform duration-200 ease-out"
        style={{
          '--topic-glow': color,
          boxShadow: `0 8px 32px ${color}18, 0 0 0 1px var(--border)`,
        } as React.CSSProperties}
      >
        <div className="card-noise rounded-2xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${color}22`, boxShadow: `0 0 24px ${color}30` }}
            >
              {icon}
            </motion.div>
            <ChevronRight
              size={18}
              className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all duration-300 mt-2"
            />
          </div>
          <h3 className="font-bold text-[var(--text-primary)] mb-2 text-lg">{title}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-5 line-clamp-2 leading-relaxed">{description}</p>
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: `${color}18`, color, boxShadow: `0 0 16px ${color}20` }}
            >
              {totalQ} questions
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">{sectionCount} sections</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
