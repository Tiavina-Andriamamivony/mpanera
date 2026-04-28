"use client"

import { useEffect, useState } from "react"
import { Loader } from "./loader"
import { JourneyTrail } from "./journey-trail"

type Section = {
  step: string
  title: string
  body: string
  detail: string
  swatch: string
}

const journey: Section[] = [
  {
    step: "01",
    title: "Vous formulez le besoin",
    body: "Une fuite. Un meuble à restaurer. Un massage après une longue semaine. Décrivez en quelques mots — Mpanera s'occupe de la traduction.",
    detail: "moins de 90 secondes",
    swatch: "var(--mp-clay)",
  },
  {
    step: "02",
    title: "Les artisans répondent",
    body: "Plombiers, ébénistes, masseurs, mécaniciens : les Mpanera vérifiés vous font une offre, avec créneau, prix et un message manuscrit.",
    detail: "en moyenne, 4 offres en 12 minutes",
    swatch: "var(--mp-mustard)",
  },
  {
    step: "03",
    title: "Vous choisissez la main",
    body: "Vous comparez les profils, lisez les avis, choisissez le créneau. Le paiement est sécurisé en Mvola, Orange Money, Airtel ou carte.",
    detail: "paiement bloqué jusqu'à la livraison",
    swatch: "var(--mp-olive)",
  },
  {
    step: "04",
    title: "Le travail se fait, vous notez",
    body: "Le service est rendu, vous validez, votre Mpanera est payé. Une note, quelques mots — la confiance grandit, le quartier aussi.",
    detail: "98% des missions terminées sans litige",
    swatch: "var(--mp-clay)",
  },
]

export function Landing() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2700)
    return () => clearTimeout(t)
  }, [])

  return (
    <main
      className="relative min-h-screen w-full overflow-x-clip text-[color:var(--mp-ink)]"
      style={{ background: "var(--mp-cream)" }}
    >
      <Loader done={loaded} />

      <Header loaded={loaded} />

      <Hero loaded={loaded} />

      <Marquee />

      <JourneySection sections={journey} />

      <CrossingSection />

      <AppPreview />

      <Testimonial />

      <Closing />

      <Footer />
    </main>
  )
}

/* ─── Header ─────────────────────────────────────────────────────────── */

function Header({ loaded }: { loaded: boolean }) {
  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 mix-blend-multiply"
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(-12px)",
        transition: "all 700ms cubic-bezier(.2,.7,.2,1) 200ms",
      }}
    >
      <div className="flex items-center justify-between px-6 pt-6 md:px-12 md:pt-9">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-display text-[28px] leading-none italic">
            Mpanera
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
            depuis Antananarivo
          </span>
        </a>
        <nav className="hidden items-center gap-8 font-mono text-[11px] tracking-[0.22em] uppercase md:flex">
          <a href="#parcours" className="hover:underline underline-offset-4">
            Le parcours
          </a>
          <a href="#metiers" className="hover:underline underline-offset-4">
            Les métiers
          </a>
          <a href="#voix" className="hover:underline underline-offset-4">
            Les voix
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/sign-in"
            className="hidden font-mono text-[11px] tracking-[0.22em] uppercase md:inline hover:underline underline-offset-4"
          >
            Se connecter
          </a>
          <a
            href="/sign-up"
            className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-medium text-[color:var(--mp-cream)]"
            style={{ background: "var(--mp-ink)" }}
          >
            <span>Rejoindre</span>
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--mp-clay)" }}
            />
          </a>
        </div>
      </div>
    </header>
  )
}

/* ─── Hero ───────────────────────────────────────────────────────────── */

function Hero({ loaded }: { loaded: boolean }) {
    return (
      <section
        className="mp-grain mp-wood relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-36"
      >
        {/* Decorative orbit */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -z-0 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.18]"
          style={{
            background:
              "conic-gradient(from 220deg, var(--mp-mustard), var(--mp-clay), var(--mp-olive), var(--mp-mustard))",
            filter: "blur(60px)",
            animation: loaded ? "mp-orbit 60s linear infinite" : "none",
          }}
        />

        {/* Side rail */}
        <div className="absolute top-32 left-6 z-10 hidden flex-col gap-3 font-mono text-[10px] tracking-[0.3em] uppercase opacity-70 md:flex">
          <span>N° 001</span>
          <span
            className="block h-px w-8"
            style={{ background: "currentColor" }}
          />
          <span>Édition continue</span>
        </div>
        <div className="absolute top-32 right-6 z-10 hidden flex-col gap-3 text-right font-mono text-[10px] tracking-[0.3em] uppercase opacity-70 md:flex">
          <span>2026 · MG</span>
          <span
            className="block h-px w-8 self-end"
            style={{ background: "currentColor" }}
          />
          <span>Manuel utilisateur</span>
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12">
          <p
            className="mb-6 font-mono text-[11px] tracking-[0.32em] uppercase"
            style={{
              opacity: loaded ? 0.7 : 0,
              transform: loaded ? "translateY(0)" : "translateY(8px)",
              transition: "all 600ms ease 600ms",
            }}
          >
            Le marché des mains habiles · Madagascar
          </p>

          <h1 className="relative max-w-[14ch] font-display text-[clamp(56px,11.5vw,184px)] leading-[0.9] font-medium tracking-[-0.03em]">
            <Word delay={700} text="Le geste" loaded={loaded} />
            <br />
            <span className="relative inline-block">
              <Word
                delay={900}
                text="juste,"
                loaded={loaded}
                italic
                color="var(--mp-clay)"
              />
              {/* Underline scribble */}
              <svg
                className="absolute -bottom-3 left-0 w-[88%]"
                viewBox="0 0 400 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 14 C 80 4, 200 22, 398 8"
                  stroke="var(--mp-clay)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="600"
                  strokeDashoffset={loaded ? 0 : 600}
                  style={{
                    transition:
                      "stroke-dashoffset 1100ms cubic-bezier(.2,.7,.2,1) 1300ms",
                  }}
                />
              </svg>
            </span>
            <br />
            <Word delay={1100} text="à la porte" loaded={loaded} />
            <br />
            <span className="inline-flex items-baseline gap-4">
              <Word delay={1300} text="d'à côté." loaded={loaded} />
              <span
                aria-hidden
                className="inline-block h-3 w-3 translate-y-[-0.6em] rounded-full"
                style={{
                  background: "var(--mp-mustard)",
                  opacity: loaded ? 1 : 0,
                  transition: "opacity 400ms ease 1500ms",
                }}
              />
            </span>
          </h1>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
            <p
              className="md:col-span-5 md:col-start-7 max-w-[42ch] text-[17px] leading-[1.55]"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "translateY(0)" : "translateY(14px)",
                transition: "all 800ms ease 1500ms",
              }}
            >
              Mpanera relie ceux qui savent faire à ceux qui ont besoin que ce
              soit fait. Un plombier à 22h, une couturière le samedi matin, un
              mécano dans votre quartier — la place de marché des mains
              malgaches.
            </p>
          </div>

          <div
            className="mt-14 flex flex-wrap items-center gap-5"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(14px)",
              transition: "all 800ms ease 1700ms",
            }}
          >
            <a
              href="/sign-up"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-4 text-[14px] font-medium text-[color:var(--mp-cream)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--mp-ink)" }}
            >
              <span className="relative z-10">Trouver un Mpanera</span>
              <span
                className="relative z-10 inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--mp-clay)" }}
              />
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: "var(--mp-clay)" }}
              />
            </a>
            <a
              href="/sign-up?role=provider"
              className="font-mono text-[12px] tracking-[0.24em] uppercase underline-offset-4 hover:underline"
            >
              Je suis artisan →
            </a>
            <div className="ml-auto hidden items-center gap-3 font-mono text-[11px] tracking-[0.22em] uppercase opacity-70 md:flex">
              <span
                className="block h-px w-12"
                style={{ background: "currentColor" }}
              />
              <span>2 318 missions cette semaine</span>
            </div>
          </div>
        </div>

        {/* Floating stamp */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-8 bottom-12 z-10 hidden h-40 w-40 origin-center md:block"
          style={{
            animation: loaded ? "mp-stamp 900ms ease 1900ms backwards" : "none",
          }}
        >
          <div
            className="relative flex h-full w-full items-center justify-center rounded-full"
            style={{
              border: "1.5px solid var(--mp-ink)",
              color: "var(--mp-ink)",
            }}
          >
            <svg viewBox="0 0 120 120" className="absolute inset-0">
              <defs>
                <path
                  id="circ"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="font-mono text-[8px] tracking-[0.22em] uppercase">
                <textPath href="#circ" fill="currentColor">
                  · vetted artisans · since 2024 · made in madagascar ·
                </textPath>
              </text>
            </svg>
            <div className="text-center">
              <div className="font-display text-[28px] leading-none italic">
                M.
              </div>
              <div className="font-mono text-[8px] tracking-[0.3em] uppercase">
                trust
              </div>
            </div>
          </div>
        </div>
      </section>
    )
}

function Word({
  text,
  delay,
  loaded,
  italic,
  color,
}: {
  text: string
  delay: number
  loaded: boolean
  italic?: boolean
  color?: string
}) {
  return (
    <span className="relative inline-block overflow-hidden align-baseline">
      <span
        className={italic ? "italic" : ""}
        style={{
          display: "inline-block",
          color,
          transform: loaded ? "translateY(0)" : "translateY(110%)",
          transition: `transform 900ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
        }}
      >
        {text}
      </span>
    </span>
  )
}

/* ─── Marquee ────────────────────────────────────────────────────────── */

function Marquee() {
  const items = [
    "Plomberie",
    "Menuiserie",
    "Massage",
    "Couture",
    "Électricité",
    "Coiffure",
    "Mécanique",
    "Peinture",
    "Maçonnerie",
    "Jardinage",
    "Cordonnerie",
    "Vitrerie",
  ]
  const row = [...items, ...items]
  return (
    <section
      className="relative overflow-hidden border-y py-7"
      style={{
        background: "var(--mp-ink)",
        color: "var(--mp-cream)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex w-max gap-12 whitespace-nowrap"
        style={{ animation: "mp-marquee 38s linear infinite" }}
      >
        {row.map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-12 font-display text-[44px] italic"
            style={{ color: i % 3 === 1 ? "var(--mp-mustard)" : undefined }}
          >
            {it}
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "var(--mp-clay)" }}
            />
          </span>
        ))}
      </div>
    </section>
  )
}

/* ─── Journey ────────────────────────────────────────────────────────── */

function JourneySection({ sections }: { sections: Section[] }) {
  return (
    <section
      id="parcours"
      className="relative px-6 py-28 md:px-12 md:py-40"
      style={{ background: "var(--mp-paper)" }}
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="md:col-span-3 font-mono text-[11px] tracking-[0.3em] uppercase opacity-70">
            Le parcours · 4 mouvements
          </p>
          <h2 className="md:col-span-9 max-w-[18ch] font-display text-[clamp(40px,6vw,84px)] leading-[0.95] tracking-[-0.02em]">
            Du <em className="italic">besoin</em> d'aujourd'hui à la{" "}
            <span style={{ color: "var(--mp-clay)" }}>main</span> de demain.
          </h2>
        </div>

        <JourneyTrail />

        <ol className="relative grid grid-cols-1 gap-x-10 gap-y-24 md:grid-cols-12">
          {sections.map((s, i) => (
            <li
              key={s.step}
              className={`group relative md:col-span-7 ${
                i % 2 === 1 ? "md:col-start-6" : "md:col-start-1"
              }`}
            >
              <div className="flex items-baseline gap-6">
                <span
                  className="font-display text-[88px] italic leading-none"
                  style={{ color: s.swatch }}
                >
                  {s.step}
                </span>
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase opacity-60">
                  mouvement
                </span>
              </div>
              <h3 className="mt-6 font-display text-[clamp(28px,3.4vw,44px)] leading-[1.05] tracking-[-0.01em]">
                {s.title}
              </h3>
              <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.6] opacity-85">
                {s.body}
              </p>
              <div
                className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase"
                style={{
                  background: "rgba(28,26,20,0.06)",
                }}
              >
                <span
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: s.swatch }}
                />
                {s.detail}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ─── Crossing — visual interlude ────────────────────────────────────── */

function CrossingSection() {
  return (
    <section
      id="metiers"
      className="mp-grain relative overflow-hidden px-6 py-28 md:px-12 md:py-44"
      style={{ background: "var(--mp-olive)", color: "var(--mp-cream)" }}
    >
      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase opacity-70">
            Pourquoi Mpanera
          </p>
          <h2 className="mt-6 font-display text-[clamp(40px,5.2vw,72px)] leading-[0.98] tracking-[-0.02em]">
            Le savoir-faire <em className="italic">malgache</em>, organisé
            comme une bibliothèque vivante.
          </h2>
        </div>
        <div className="md:col-span-7">
          <dl className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2">
            {[
              {
                k: "Vérification humaine",
                v: "Chaque artisan est rencontré, papiers à l'appui, avant son premier client.",
              },
              {
                k: "Paiement séquestre",
                v: "Mvola, Orange Money, Airtel ou carte. Bloqué jusqu'à votre validation.",
              },
              {
                k: "Réputation locale",
                v: "Les notes alimentent une moyenne réelle, pas un score caché.",
              },
              {
                k: "Réponse en minutes",
                v: "Une notification rejoint plusieurs Mpanera autour de vous, en parallèle.",
              },
            ].map((it) => (
              <div key={it.k} className="border-t pt-6 border-[rgba(244,236,216,0.18)]">
                <dt className="font-display text-[26px] leading-tight italic">
                  {it.k}
                </dt>
                <dd className="mt-3 max-w-[40ch] text-[15px] leading-[1.6] opacity-85">
                  {it.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Big watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -bottom-24 z-0 font-display text-[clamp(180px,22vw,360px)] italic select-none"
        style={{ color: "rgba(206,184,104,0.12)" }}
      >
        Mpanera
      </span>
    </section>
  )
}

/* ─── App preview — bridge landing → app ───────────────────────────── */

function AppPreview() {
  return (
    <section
      id="apercu"
      className="relative overflow-hidden px-6 py-28 md:px-12 md:py-40"
      style={{ background: "var(--mp-cream)", color: "var(--mp-ink)" }}
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="md:col-span-3 font-mono text-[11px] tracking-[0.3em] uppercase opacity-70">
            La suite · l'application
          </p>
          <h2 className="md:col-span-9 max-w-[20ch] font-display text-[clamp(40px,6vw,84px)] leading-[0.95] tracking-[-0.02em]">
            Ce qui vous attend,{" "}
            <em className="italic" style={{ color: "var(--mp-clay)" }}>
              une fois la porte poussée.
            </em>
          </h2>
        </div>

        <div className="relative">
          {/* Window chrome */}
          <div
            className="relative overflow-hidden rounded-[28px] border shadow-[0_40px_120px_-40px_rgba(28,26,20,0.35)]"
            style={{
              background: "var(--mp-paper)",
              borderColor: "rgba(28,26,20,0.12)",
            }}
          >
            <div
              className="flex items-center gap-2 border-b px-5 py-3.5"
              style={{ borderColor: "rgba(28,26,20,0.08)" }}
            >
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ background: "var(--mp-clay)" }}
              />
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ background: "var(--mp-mustard)" }}
              />
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ background: "var(--mp-olive)" }}
              />
              <span className="ml-4 font-mono text-[10px] tracking-[0.24em] uppercase opacity-60">
                mpanera.mg / app / explorer
              </span>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-12 md:gap-7 md:p-8">
              {/* Search + comparison column */}
              <div className="md:col-span-7 space-y-7">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] tracking-[0.28em] uppercase opacity-60">
                    01 — cherchez
                  </p>
                  <h3 className="font-display text-[clamp(22px,2.4vw,32px)] italic leading-tight">
                    Une fuite ? Un meuble ? Un massage ?
                  </h3>
                </div>

                <div
                  className="flex items-center gap-3 rounded-full border px-5 py-3.5"
                  style={{
                    background: "var(--mp-cream)",
                    borderColor: "rgba(28,26,20,0.12)",
                  }}
                >
                  <span
                    className="block h-2 w-2 rounded-full"
                    style={{ background: "var(--mp-clay)" }}
                  />
                  <span className="font-mono text-[12px] opacity-80">
                    Plombier disponible ce soir, 67ha…
                  </span>
                  <span
                    className="ml-auto inline-block h-3 w-px"
                    style={{
                      background: "var(--mp-ink)",
                      animation: "mp-blink 1100ms infinite",
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Plomberie",
                    "Massage",
                    "Couture",
                    "Mécanique",
                    "Électricité",
                  ].map((c, i) => (
                    <span
                      key={c}
                      className="rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase"
                      style={{
                        borderColor:
                          i === 0 ? "var(--mp-clay)" : "rgba(28,26,20,0.16)",
                        color:
                          i === 0 ? "var(--mp-clay)" : "rgba(28,26,20,0.7)",
                        background:
                          i === 0 ? "rgba(218,144,76,0.08)" : "transparent",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="font-mono text-[10px] tracking-[0.28em] uppercase opacity-60">
                    02 — comparez
                  </p>
                  {[
                    {
                      name: "Rakoto J.",
                      role: "Plombier · Ankorondrano",
                      rating: "4.9",
                      jobs: 142,
                      verified: true,
                      init: "Ra",
                    },
                    {
                      name: "Hery R.",
                      role: "Plombier · 67ha",
                      rating: "4.8",
                      jobs: 89,
                      verified: true,
                      init: "He",
                    },
                    {
                      name: "Naina V.",
                      role: "Plombier · Ivandry",
                      rating: "4.7",
                      jobs: 56,
                      verified: false,
                      init: "Na",
                    },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center gap-4 rounded-2xl border px-4 py-3.5"
                      style={{
                        background: "var(--mp-cream)",
                        borderColor: "rgba(28,26,20,0.1)",
                      }}
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full font-display text-[16px] italic"
                        style={{
                          background: "var(--mp-mustard)",
                          color: "var(--mp-ink)",
                        }}
                      >
                        {p.init}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[16px] italic">
                            {p.name}
                          </span>
                          {p.verified ? (
                            <span
                              className="rounded-full px-2 py-0.5 font-mono text-[8px] tracking-[0.18em] uppercase"
                              style={{
                                background: "var(--mp-olive)",
                                color: "var(--mp-cream)",
                              }}
                            >
                              vérifié
                            </span>
                          ) : null}
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-60">
                          {p.role}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="font-display text-[18px] italic"
                          style={{ color: "var(--mp-clay)" }}
                        >
                          ★ {p.rating}
                        </div>
                        <div className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-60">
                          {p.jobs} missions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chosen + payment + review column */}
              <div className="md:col-span-5 space-y-4">
                <p className="font-mono text-[10px] tracking-[0.28em] uppercase opacity-60">
                  03 — la main choisie
                </p>

                <div
                  className="rounded-3xl p-6 text-[color:var(--mp-cream)]"
                  style={{ background: "var(--mp-ink)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full font-display text-[18px] italic"
                      style={{
                        background: "var(--mp-clay)",
                        color: "var(--mp-ink)",
                      }}
                    >
                      Ra
                    </div>
                    <div>
                      <div className="font-display text-[20px] italic">
                        Rakoto J.
                      </div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
                        Plombier · 14 ans de geste
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div
                      className="rounded-2xl px-3 py-3"
                      style={{ background: "rgba(244,236,216,0.08)" }}
                    >
                      <div className="font-mono text-[8px] tracking-[0.2em] uppercase opacity-70">
                        note
                      </div>
                      <div
                        className="mt-1 font-display text-[22px] italic"
                        style={{ color: "var(--mp-mustard)" }}
                      >
                        4.9
                      </div>
                    </div>
                    <div
                      className="rounded-2xl px-3 py-3"
                      style={{ background: "rgba(244,236,216,0.08)" }}
                    >
                      <div className="font-mono text-[8px] tracking-[0.2em] uppercase opacity-70">
                        missions
                      </div>
                      <div
                        className="mt-1 font-display text-[22px] italic"
                        style={{ color: "var(--mp-clay)" }}
                      >
                        142
                      </div>
                    </div>
                    <div
                      className="rounded-2xl px-3 py-3"
                      style={{ background: "rgba(244,236,216,0.08)" }}
                    >
                      <div className="font-mono text-[8px] tracking-[0.2em] uppercase opacity-70">
                        réponse
                      </div>
                      <div
                        className="mt-1 font-display text-[22px] italic"
                        style={{ color: "var(--mp-mustard)" }}
                      >
                        11′
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-3xl border p-5"
                  style={{
                    background: "var(--mp-cream)",
                    borderColor: "rgba(28,26,20,0.1)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
                      paiement séquestre
                    </p>
                    <span
                      className="rounded-full px-2.5 py-1 font-mono text-[8px] tracking-[0.18em] uppercase"
                      style={{
                        background: "rgba(107,110,80,0.12)",
                        color: "var(--mp-olive)",
                      }}
                    >
                      bloqué
                    </span>
                  </div>
                  <div className="mt-3 font-display text-[28px] italic">
                    Ar 85 000
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {["Mvola", "Orange", "Airtel", "Carte"].map((m) => (
                      <span
                        key={m}
                        className="rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] uppercase"
                        style={{
                          borderColor: "rgba(28,26,20,0.14)",
                          color: "rgba(28,26,20,0.75)",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between gap-3 rounded-3xl px-5 py-4"
                  style={{ background: "var(--mp-mustard)" }}
                >
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.22em] uppercase opacity-70">
                      04 — vous notez
                    </div>
                    <div className="mt-1 font-display text-[18px] italic">
                      « Rapide et propre. »
                    </div>
                  </div>
                  <div
                    className="font-display text-[20px] italic"
                    style={{ color: "var(--mp-clay)" }}
                  >
                    ★★★★★
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial annotations */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 left-2 hidden font-mono text-[10px] tracking-[0.28em] uppercase opacity-70 md:block"
            style={{ color: "var(--mp-olive)" }}
          >
            ↘ aperçu, sans filtre
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-6 right-2 hidden font-mono text-[10px] tracking-[0.28em] uppercase opacity-70 md:block"
            style={{ color: "var(--mp-clay)" }}
          >
            la suite vous attend ↗
          </span>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6">
          <p className="max-w-[46ch] text-[15px] leading-[1.6] opacity-80">
            La même main, du premier mot au dernier ★. Une seule application,
            trois couleurs tenues comme un fil rouge — olive, moutarde, terre
            cuite.
          </p>
          <div className="flex items-center gap-3">
            <span
              className="block h-3 w-3 rounded-full"
              style={{ background: "var(--mp-olive)" }}
              title="#6B6E50"
            />
            <span
              className="block h-3 w-3 rounded-full"
              style={{ background: "var(--mp-mustard)" }}
              title="#CEB868"
            />
            <span
              className="block h-3 w-3 rounded-full"
              style={{ background: "var(--mp-clay)" }}
              title="#DA904C"
            />
            <a
              href="/app/explorer"
              className="ml-3 inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-[13px] font-medium text-[color:var(--mp-cream)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--mp-olive)" }}
            >
              Entrer dans l'application
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--mp-mustard)" }}
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonial ───────────────────────────────────────────────────── */

function Testimonial() {
  return (
    <section
      id="voix"
      className="relative overflow-hidden px-6 py-28 md:px-12 md:py-40"
      style={{ background: "var(--mp-cream)" }}
    >
      <div className="mx-auto max-w-[1100px]">
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase opacity-70">
          Voix · Antananarivo, 67ha
        </p>
        <blockquote className="mt-8">
          <p className="font-display text-[clamp(32px,4.6vw,68px)] leading-[1.05] tracking-[-0.01em]">
            <span className="text-[1.4em] leading-none align-[-0.2em]" style={{ color: "var(--mp-clay)" }}>
              «
            </span>{" "}
            J'ai été appelée pour réparer une machine à coudre à 21h. Le
            client venait de retrouver le manuel{" "}
            <em className="italic" style={{ color: "var(--mp-clay)" }}>
              de sa grand-mère
            </em>
            . Je suis repartie avec une commande pour trois robes.{" "}
            <span className="text-[1.4em] leading-none align-[-0.2em]" style={{ color: "var(--mp-clay)" }}>
              »
            </span>
          </p>
        </blockquote>
        <div className="mt-10 flex items-center gap-5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full font-display text-[22px] italic"
            style={{
              background: "var(--mp-mustard)",
              color: "var(--mp-ink)",
            }}
          >
            Ra
          </div>
          <div>
            <div className="font-display text-[18px] italic">
              Rasoanirina V.
            </div>
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
              Couturière · 4,9 ★ · 137 missions
            </div>
          </div>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <span
              className="block h-2 w-2 rounded-full"
              style={{ background: "var(--mp-clay)" }}
            />
            <span
              className="block h-2 w-2 rounded-full"
              style={{ background: "var(--mp-mustard)" }}
            />
            <span
              className="block h-2 w-2 rounded-full"
              style={{ background: "var(--mp-olive)" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Closing ───────────────────────────────────────────────────────── */

function Closing() {
  return (
    <section
      className="mp-grain relative overflow-hidden px-6 py-32 md:px-12 md:py-48"
      style={{ background: "var(--mp-clay)", color: "var(--mp-ink)" }}
    >
      <div className="relative z-10 mx-auto max-w-[1280px] text-center">
        <p className="font-mono text-[11px] tracking-[0.32em] uppercase opacity-70">
          Prochaine étape
        </p>
        <h2 className="mt-6 font-display text-[clamp(56px,10vw,168px)] italic leading-[0.9] tracking-[-0.03em]">
          Posez votre <br /> besoin.
        </h2>
        <p className="mx-auto mt-8 max-w-[52ch] text-[17px] leading-[1.55]">
          Une main est en train d'attacher son tablier. Elle attend juste de
          savoir où aller.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
          <a
            href="/sign-up"
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[14px] font-medium text-[color:var(--mp-cream)]"
            style={{ background: "var(--mp-ink)" }}
          >
            Commencer maintenant
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "var(--mp-mustard)" }}
            />
          </a>
          <a
            href="/app/explorer"
            className="font-mono text-[12px] tracking-[0.24em] uppercase underline-offset-4 hover:underline"
          >
            Voir les artisans →
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer
      className="relative px-6 py-12 md:px-12"
      style={{ background: "var(--mp-ink)", color: "var(--mp-cream)" }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-8">
        <div>
          <div className="font-display text-[44px] italic leading-none">
            Mpanera.
          </div>
          <div className="mt-3 font-mono text-[10px] tracking-[0.28em] uppercase opacity-60">
            Antananarivo · Toamasina · Mahajanga · Toliara
          </div>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-3 font-mono text-[11px] tracking-[0.22em] uppercase opacity-80">
          <a href="#parcours" className="hover:opacity-100">
            Parcours
          </a>
          <a href="#metiers" className="hover:opacity-100">
            Métiers
          </a>
          <a href="/sign-in" className="hover:opacity-100">
            Connexion
          </a>
          <a href="/sign-up" className="hover:opacity-100">
            Inscription
          </a>
        </div>
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-60">
          © 2026 — fait à la main, à Tana.
        </div>
      </div>
    </footer>
  )
}
