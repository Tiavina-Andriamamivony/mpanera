"use client"

import Link from "next/link"
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  Star,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProviderListItem = {
  id: string
  fullName: string
  companyName?: string | null
  bio?: string | null
  neighborhood?: string | null
  city?: string | null
  averageRating: number
  completedJobsCount: number
  verified: boolean
  responseTime?: string | null
  indicativePrice?: string | null
  photoInitials: string
  categories: {
    id: string
    name: string
  }[]
}

type ProviderListProps = {
  providers: ProviderListItem[]
  selectedProviderIds?: string[]
  onToggleProvider?: (providerId: string) => void
  emptyMessage?: string
}

export function ProviderList({
  providers,
  selectedProviderIds = [],
  onToggleProvider,
  emptyMessage = "Aucun prestataire ne correspond encore a cette recherche.",
}: ProviderListProps) {
  if (providers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {providers.map((provider) => {
        const isSelected = selectedProviderIds.includes(provider.id)
        const location =
          [provider.neighborhood, provider.city].filter(Boolean).join(", ") ||
          "Localisation non renseignee"

        return (
          <article
            key={provider.id}
            className="rounded-xl border border-border/70 bg-background/70 p-4 transition-colors hover:bg-muted/20"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 font-semibold text-primary">
                  {provider.photoInitials}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {provider.fullName}
                    </h3>
                    {provider.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] text-primary">
                        <BadgeCheck className="size-3.5" />
                        Verifie
                      </span>
                    ) : null}
                  </div>
                  {provider.companyName ? (
                    <p className="text-sm text-muted-foreground">
                      {provider.companyName}
                    </p>
                  ) : null}
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {provider.bio || "Aucune presentation n'a encore ete ajoutee."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {provider.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="my-4 grid gap-2 border-t py-4 text-sm text-muted-foreground lg:min-w-56">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-primary" />
                  <span className="font-medium text-foreground">
                    {provider.averageRating.toFixed(1)}
                  </span>
                  <span>sur 5</span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="size-4" />
                  <span>{provider.completedJobsCount} missions terminees</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4" />
                  <span>{provider.responseTime || "Delai de reponse indisponible"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {provider.indicativePrice || "Tarif indicatif indisponible"}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href={`/prestataires/${provider.id}`}>Voir le profil</Link>
                </Button>
                {onToggleProvider ? (
                  <Button
                    type="button"
                    variant={isSelected ? "secondary" : "default"}
                    className={cn(
                      isSelected ? "bg-secondary text-secondary-foreground" : ""
                    )}
                    onClick={() => onToggleProvider(provider.id)}
                  >
                    {isSelected ? "Selectionne" : "Selectionner"}
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
