'use client'
import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  life: number
  maxLife: number
}

type ConfettiBurstProps = {
  trigger: number
  x?: number
  y?: number
}

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24']

export default function ConfettiBurst({ trigger, x, y }: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const prevTrigger = useRef(0)

  useEffect(() => {
    if (trigger === prevTrigger.current || trigger === 0) return
    prevTrigger.current = trigger

    const canvas = canvasRef.current
    if (!canvas) return

    const cx = x ?? window.innerWidth / 2
    const cy = y ?? window.innerHeight / 2

    for (let i = 0; i < 48; i++) {
      const angle = (Math.PI * 2 * i) / 48 + Math.random() * 0.5
      const speed = 4 + Math.random() * 8
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      })
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => {
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.18
        p.vx *= 0.98
        p.rotation += p.rotationSpeed

        const alpha = 1 - p.life / p.maxLife
        if (alpha <= 0) return false

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
        return true
      })

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [trigger, x, y])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[200]"
      aria-hidden
    />
  )
}
