export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="play-icon-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef4444" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path d="M6 4 L20 12 L6 20 Z" fill="url(#play-icon-gradient)" />
    </svg>
  )
}

export function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6 4 L20 12 L6 20 Z" />
    </svg>
  )
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5 L16 12 L8 19 Z" />
    </svg>
  )
}
