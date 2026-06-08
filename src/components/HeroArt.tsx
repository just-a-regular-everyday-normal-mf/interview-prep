export default function HeroArt() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hero-art-svg"
        style={{
          width: 'min(90vw, 700px)',
          height: 'min(90vw, 700px)',
          opacity: 0.35,
        }}
      >
        <circle cx="400" cy="400" r="280" stroke="url(#hero-grad-1)" strokeWidth="1.5" opacity="0.4" />
        <circle cx="400" cy="400" r="220" stroke="url(#hero-grad-2)" strokeWidth="1" opacity="0.3" />
        <circle cx="400" cy="400" r="160" stroke="url(#hero-grad-1)" strokeWidth="2" opacity="0.25" />
        <ellipse cx="400" cy="400" rx="320" ry="180" stroke="#06b6d4" strokeWidth="1" opacity="0.15" transform="rotate(45 400 400)" />
        <ellipse cx="400" cy="400" rx="320" ry="180" stroke="#8b5cf6" strokeWidth="1" opacity="0.15" transform="rotate(-45 400 400)" />
        <defs>
          <linearGradient id="hero-grad-1" x1="0" y1="0" x2="800" y2="800">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="hero-grad-2" x1="800" y1="0" x2="0" y2="800">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
