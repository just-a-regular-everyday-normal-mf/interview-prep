'use client'

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-icon"
      aria-hidden
    >
      <defs>
        <linearGradient id="bolt-grad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="bolt-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="32" height="32" rx="9" fill="rgba(139,92,246,0.12)" />
      <path
        d="M18.5 4L10 17h6.5l-2.5 11 10-14h-6.5L18.5 4z"
        fill="url(#bolt-grad)"
        filter="url(#bolt-glow)"
        className="logo-bolt"
      />
    </svg>
  )
}
