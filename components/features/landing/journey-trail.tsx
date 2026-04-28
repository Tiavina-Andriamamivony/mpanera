"use client"

import { useEffect, useRef, useState } from "react"

export function JourneyTrail() {
  const ref = useRef<SVGSVGElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = rect.height + vh
      const seen = Math.min(total, Math.max(0, vh - rect.top))
      setProgress(Math.min(1, seen / total))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const length = 2400

  return (
    <svg
      ref={ref}
      viewBox="0 0 800 1600"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="mp-line" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--mp-clay)" />
          <stop offset="50%" stopColor="var(--mp-mustard)" />
          <stop offset="100%" stopColor="var(--mp-olive)" />
        </linearGradient>
      </defs>

      {/* Hand-drawn meandering path through the four steps */}
      <path
        d="M120 80 C 320 40, 560 220, 600 400 S 200 600, 180 820 S 700 1020, 640 1240 S 220 1380, 320 1560"
        fill="none"
        stroke="rgba(28,26,20,0.12)"
        strokeWidth="2"
        strokeDasharray="4 8"
      />
      <path
        d="M120 80 C 320 40, 560 220, 600 400 S 200 600, 180 820 S 700 1020, 640 1240 S 220 1380, 320 1560"
        fill="none"
        stroke="url(#mp-line)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />

      {/* Waypoint dots */}
      {[
        { cx: 120, cy: 80 },
        { cx: 600, cy: 400 },
        { cx: 180, cy: 820 },
        { cx: 640, cy: 1240 },
        { cx: 320, cy: 1560 },
      ].map((p, i) => (
        <g key={i}>
          <circle
            cx={p.cx}
            cy={p.cy}
            r={i === 0 || i === 4 ? 9 : 6}
            fill="var(--mp-paper)"
            stroke="var(--mp-ink)"
            strokeWidth="2"
          />
          <circle
            cx={p.cx}
            cy={p.cy}
            r="2.5"
            fill="var(--mp-clay)"
          />
        </g>
      ))}
    </svg>
  )
}
