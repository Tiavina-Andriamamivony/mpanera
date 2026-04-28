import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
  actions?: React.ReactNode
}

export function PageIntro({ title, actions }: PageIntroProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full items-center justify-between">
          {/* <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            {eyebrow}
          </p> */}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {/* <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p> */}
          {actions ? (
            <div className="flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function PageBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto max-w-7xl px-6 py-8", className)}>
      {children}
    </div>
  )
}

export function Surface({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border/70 bg-background/80 p-5 transition-colors duration-200",
        className
      )}
    >
      {children}
    </section>
  )
}

export function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export function MiniStat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  )
}

export function ActionLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
  tone?: "default" | "primary"
}) {
  return (
    <Link
      href={href}
      className={cn([buttonVariants({ variant: "outline" }), "px-4 py-2"])}
    >
      {children}
    </Link>
  )
}

export function ListRow({
  icon: Icon,
  title,
  description,
  meta,
}: {
  icon: LucideIcon
  title: string
  description: string
  meta?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 px-4 py-4 transition-colors hover:bg-muted/20">
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 h-fit rounded-lg border border-border/70 p-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {meta ? <div className="shrink-0">{meta}</div> : null}
    </div>
  )
}
