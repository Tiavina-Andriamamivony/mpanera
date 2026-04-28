"use client"

import { useEffect, useState } from "react"

const labels = [
  "Allumage de l'atelier",
  "Réveil des artisans",
  "Mise en route des outils",
  "Ouverture de la place",
]

export function Loader({ done }: { done: boolean }) {
  const [progress, setProgress] = useState(0)
  const [labelIdx, setLabelIdx] = useState(0)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 2400)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased)
      setLabelIdx(Math.min(labels.length - 1, Math.floor(eased * labels.length)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      aria-hidden={done}
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        animation: done
          ? "mp-curtain-up 1100ms cubic-bezier(.85,0,.15,1) 200ms forwards"
          : undefined,
        background: "var(--mp-ink)",
        color: "var(--mp-cream)",
      }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.10 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' /></svg>\")",
          opacity: 0.55,
          mixBlendMode: "overlay",
        }}
      />

      {/* Animated radial pulse */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(218,144,76,0.45) 0%, rgba(206,184,104,0.15) 35%, transparent 70%)",
          filter: "blur(40px)",
          animation: "mp-orbit 18s linear infinite",
        }}
      />

      {/* Top brand row */}
      <div className="absolute top-8 right-8 left-8 flex items-center justify-between font-mono text-[10px] tracking-[0.28em] uppercase opacity-80 md:top-10 md:right-12 md:left-12">
        <span>Mpanera · 001 · 2026</span>
        <span className="hidden md:inline">Antananarivo · 18°54' S</span>
      </div>

      {/* Center stack */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        {/* Wordmark with mask reveal */}
        <div className="relative">
          <h1 className="font-display text-[clamp(72px,16vw,220px)] leading-[0.9] tracking-[-0.03em]">
            <span className="relative inline-block overflow-hidden align-baseline">
              <span
                className="inline-block italic"
                style={{
                  transform: `translateY(${(1 - progress) * 100}%)`,
                  transition: "transform 600ms cubic-bezier(.2,.8,.2,1)",
                  color: "var(--mp-cream)",
                }}
              >
                Mpane
              </span>
            </span>
            <span className="relative inline-block overflow-hidden align-baseline">
              <span
                className="inline-block italic"
                style={{
                  transform: `translateY(${(1 - progress) * 100}%)`,
                  transition: "transform 700ms cubic-bezier(.2,.8,.2,1) 80ms",
                  color: "var(--mp-clay)",
                }}
              >
                ra.
              </span>
            </span>
          </h1>

          {/* Hand traveling through the wordmark — the journey */}
          <svg
            aria-hidden
            viewBox="0 0 800 80"
            className="absolute -bottom-3 left-0 h-6 w-full"
          >
            <path
              d="M10 60 Q 120 0, 240 50 T 480 40 T 760 30"
              fill="none"
              stroke="var(--mp-mustard)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1200"
              strokeDashoffset={(1 - progress) * 1200}
            />
            <circle
              cx={10 + progress * 750}
              cy={60 - progress * 30}
              r="6"
              fill="var(--mp-clay)"
            />
          </svg>
        </div>

        {/* Sub line */}
        <p
          className="mt-10 max-w-[28ch] text-[15px] leading-[1.5] opacity-70"
          style={{ animation: "mp-fade 700ms ease 200ms backwards" }}
        >
          La place de marché des artisans malgaches s'ouvre devant vous.
        </p>

        {/* Progress system */}
        <div className="mt-14 w-[min(560px,86vw)]">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.3em] uppercase opacity-80">
            <span>{labels[labelIdx]}</span>
            <span className="tabular-nums">
              {String(Math.round(progress * 100)).padStart(3, "0")}%
              <span className="ml-2 inline-block" style={{ animation: "mp-blink 900ms steps(1) infinite" }}>
                ▍
              </span>
            </span>
          </div>
          <div
            className="mt-3 h-[3px] w-full overflow-hidden"
            style={{ background: "rgba(244,236,216,0.12)" }}
          >
            <div
              className="h-full origin-left"
              style={{
                background:
                  "linear-gradient(90deg, var(--mp-olive), var(--mp-mustard), var(--mp-clay))",
                transform: `scaleX(${progress})`,
                transition: "transform 120ms linear",
              }}
            />
          </div>
          <div className="mt-3 grid grid-cols-4 font-mono text-[9px] tracking-[0.22em] uppercase opacity-60">
            {labels.map((l, i) => (
              <span
                key={l}
                className={i <= labelIdx ? "" : "opacity-40"}
                style={{
                  color:
                    i <= labelIdx ? "var(--mp-mustard)" : "var(--mp-cream)",
                }}
              >
                · 0{i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom corners */}
      <div className="absolute right-8 bottom-8 left-8 flex items-end justify-between font-mono text-[10px] tracking-[0.28em] uppercase opacity-70 md:right-12 md:bottom-10 md:left-12">
        <span>Manuel · v1.0</span>
        <span className="hidden md:inline">Patientez — l'atelier s'éveille</span>
      </div>
    </div>
  )
}
