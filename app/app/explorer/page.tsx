"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { MapPin, Search, Users } from "lucide-react"

import {
  ActionLink,
  MiniStat,
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
} from "@/components/features/app/page-primitives"
import {
  ProviderList,
  type ProviderListItem,
} from "@/components/features/providers/provider-list"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { categoriesService, providersService } from "@/lib/services"
import type { CategoryWithChildren, ProviderSearchItem } from "@/types/api"

function flattenCategories(
  categories: CategoryWithChildren[]
): CategoryWithChildren[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children ? flattenCategories(category.children) : []),
  ])
}

function getProviderInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function mapProviderToListItem(provider: ProviderSearchItem): ProviderListItem {
  return {
    id: provider.id,
    fullName: provider.fullName,
    companyName: provider.companyName,
    bio: provider.bio,
    neighborhood: provider.neighborhood,
    city: provider.city,
    averageRating: provider.averageRating,
    completedJobsCount: provider.completedJobsCount,
    verified: provider.verified,
    responseTime: null,
    indicativePrice: null,
    photoInitials: getProviderInitials(provider.fullName),
    categories: provider.categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  }
}

export default function ExplorerPage() {
  const [query, setQuery] = useState("")
  const [district, setDistrict] = useState("")
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [providers, setProviders] = useState<ProviderSearchItem[]>([])
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)
  const deferredDistrict = useDeferredValue(district)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [providerResponse, categoryResponse] = await Promise.all([
          providersService.search(
            activeCategoryId ? { categoryId: activeCategoryId } : undefined
          ),
          categoriesService.list(),
        ])

        if (cancelled) return

        setProviders(providerResponse.data)
        setCategories(categoryResponse)
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les donnees du marketplace."
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [activeCategoryId])

  const availableCategories = useMemo(
    () => flattenCategories(categories),
    [categories]
  )

  const filteredProviders = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    const normalizedDistrict = deferredDistrict.trim().toLowerCase()

    return providers.map(mapProviderToListItem).filter((provider) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        provider.fullName.toLowerCase().includes(normalizedQuery) ||
        provider.bio?.toLowerCase().includes(normalizedQuery)

      const matchesDistrict =
        normalizedDistrict.length === 0 ||
        (provider.city || "").toLowerCase().includes(normalizedDistrict) ||
        (provider.neighborhood || "").toLowerCase().includes(normalizedDistrict)

      return matchesQuery && matchesDistrict
    })
  }, [deferredDistrict, deferredQuery, providers])

  return (
    <div className="h-full overflow-y-auto">
      <PageIntro
        eyebrow=""
        title="Trouvez un prestataire pour votre besoin."
        description=""
        actions={<ActionLink href="/app/requests">Nouvelle demande</ActionLink>}
      />

      <PageBody className="space-y-8">
        <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
          <Surface className="space-y-6">
            <SectionTitle
              title="Recherche rapide"
              description="Filtrez les profils par besoin, zone et specialite avant d&apos;envoyer une demande."
            />
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
              <InputGroup>
                <InputGroupAddon>
                  <Search className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="De quel service avez-vous besoin ?"
                />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <MapPin className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder="Quartier ou district"
                />
              </InputGroup>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setDistrict("")
                  setActiveCategoryId(null)
                }}
              >
                Reinitialiser
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={activeCategoryId === null ? "default" : "outline"}
                onClick={() => setActiveCategoryId(null)}
              >
                Tous
              </Button>
              {availableCategories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  size="sm"
                  variant={
                    activeCategoryId === category.id ? "default" : "outline"
                  }
                  onClick={() =>
                    setActiveCategoryId((current) =>
                      current === category.id ? null : category.id
                    )
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </Surface>

          <Surface className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <MiniStat
              label="Prestataires visibles"
              value={loading ? "..." : String(filteredProviders.length)}
              hint={
                error
                  ? "Impossible de charger les donnees des prestataires pour le moment."
                  : "Profils correspondant aux filtres actifs."
              }
            />
            <MiniStat
              label="Moyenne"
              value={
                filteredProviders.length === 0
                  ? "0.0"
                  : (
                      filteredProviders.reduce(
                        (sum, provider) => sum + provider.averageRating,
                        0
                      ) / filteredProviders.length
                    ).toFixed(1)
              }
              hint="Note moyenne sur les profils visibles."
            />
            <MiniStat
              label="Verifies"
              value={String(
                filteredProviders.filter((provider) => provider.verified).length
              )}
              hint="Profils deja verifies."
            />
          </Surface>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Surface className="space-y-4">
            <SectionTitle
              title="Profils prestataires"
              description="Chaque profil public peut etre consulte avant l'envoi d'une demande."
            />
            {error ? (
              <div className="rounded-lg border border-dashed border-destructive/30 px-4 py-8 text-sm text-destructive">
                {error}
              </div>
            ) : loading ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                Chargement des prestataires...
              </div>
            ) : (
              <ProviderList providers={filteredProviders} />
            )}
          </Surface>

          <Surface className="space-y-5">
            <SectionTitle
              title="Parcours MVP"
              description="Ce parcours couvre l'experience de navigation libre decrite dans le README."
            />
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <div className="flex items-start gap-3">
                <Users className="mt-1 size-4 text-primary" />
                <p>parcourir les profils publics sans devoir se connecter</p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-1 size-4 text-primary" />
                <p>comparer les notes, la zone d&apos;intervention et les tarifs indicatifs</p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-1 size-4 text-primary" />
                <p>
                  passer a la page des demandes pour contacter un ou plusieurs prestataires
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
              Les filtres avances du README, comme la distance reelle ou le tri
              dynamique, pourront ensuite se brancher sur `providersService.search`.
            </div>
          </Surface>
        </div>
      </PageBody>
    </div>
  )
}
