'use client'

type GradientMeshProps = {
  className?: string
  intensity?: 'hero' | 'subtle'
}

export default function GradientMesh({ className = '', intensity = 'hero' }: GradientMeshProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      <div className={`gradient-mesh ${intensity === 'subtle' ? 'gradient-mesh--subtle' : ''}`} />
      <div className="gradient-orb gradient-orb--violet" />
      <div className="gradient-orb gradient-orb--blue" />
      <div className="gradient-orb gradient-orb--emerald" />
    </div>
  )
}
