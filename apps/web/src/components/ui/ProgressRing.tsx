import { useEffect, useState } from 'react'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

export default function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = 'var(--color-accent)',
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const [dash, setDash] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setDash(Math.min(1, Math.max(0, percentage / 100)) * circumference)
    }, 120)
    return () => clearTimeout(t)
  }, [percentage, circumference])

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-(--color-border) opacity-30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />
    </svg>
  )
}
