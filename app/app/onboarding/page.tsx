"use client"

import { useEffect, useMemo, useState } from "react"
import { Compass, Loader2, SendHorizonal, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
  Tag,
} from "@/components/features/app/page-primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Category } from "@/lib/generated/prisma/client"
import { MOCK_CATEGORIES } from "@/lib/mock-categories"
import { categoriesService, onboardingService, usersService } from "@/lib/services"
import type {
  CategoryWithChildren,
  CompleteClientOnboardingRequest,
  CompleteProviderOnboardingRequest,
  Me,
} from "@/types/api"

type ClientFormState = {
  firstName: string
  lastName: string
  district: string
  city: string
  neighborhood: string
}

type ProviderFormState = {
  fullName: string
  companyName: string
  bio: string
  district: string
  city: string
  neighborhood: string
  categoryIds: string[]
}

function flattenCategories(categories: CategoryWithChildren[]): Category[] {
  return categories.flatMap((category) => [
    {
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
    },
    ...(category.children ? flattenCategories(category.children) : []),
  ])
}

export default function OnboardingPage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNeedId, setSelectedNeedId] = useState<string>(MOCK_CATEGORIES[0]?.id ?? "")
  const [clientDestination, setClientDestination] = useState<"explorer" | "requests">("explorer")
  const [clientForm, setClientForm] = useState<ClientFormState>({
    firstName: "",
    lastName: "",
    district: "",
    city: "",
    neighborhood: "",
  })
  const [providerForm, setProviderForm] = useState<ProviderFormState>({
    fullName: "",
    companyName: "",
    bio: "",
    district: "",
    city: "",
    neighborhood: "",
    categoryIds: [],
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [meResponse, categoriesResponse] = await Promise.all([
          usersService.me(),
          categoriesService.list(),
        ])

        if (cancelled) return

        const flatCategories = flattenCategories(categoriesResponse)
        const availableCategories =
          flatCategories.length > 0 ? flatCategories : MOCK_CATEGORIES

        setMe(meResponse)
        setCategories(availableCategories)
        setSelectedNeedId((current) => current || availableCategories[0]?.id || "")
        setProviderForm((current) => ({
          ...current,
          categoryIds:
            current.categoryIds.length > 0
              ? current.categoryIds
              : availableCategories[0]
                ? [availableCategories[0].id]
                : [],
        }))
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger votre contexte d'onboarding."
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedNeed = useMemo(
    () => categories.find((category) => category.id === selectedNeedId) ?? null,
    [categories, selectedNeedId]
  )

  async function handleClientSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const body: CompleteClientOnboardingRequest = {
      firstName: clientForm.firstName.trim(),
      lastName: clientForm.lastName.trim(),
      district: clientForm.district.trim() || undefined,
      city: clientForm.city.trim() || undefined,
      neighborhood: clientForm.neighborhood.trim() || undefined,
    }

    try {
      await onboardingService.completeClient(body)
      router.push(
        clientDestination === "explorer"
          ? `/app/explorer?category=${selectedNeedId}`
          : `/app/requests?category=${selectedNeedId}`
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de terminer l'onboarding client."
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleProviderSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const body: CompleteProviderOnboardingRequest = {
      fullName: providerForm.fullName.trim(),
      companyName: providerForm.companyName.trim() || undefined,
      bio: providerForm.bio.trim() || undefined,
      district: providerForm.district.trim() || undefined,
      city: providerForm.city.trim() || undefined,
      neighborhood: providerForm.neighborhood.trim() || undefined,
      categoryIds: providerForm.categoryIds,
    }

    try {
      await onboardingService.completeProvider(body)
      router.push("/app/notifications")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de terminer l'onboarding prestataire."
      )
    } finally {
      setSubmitting(false)
    }
  }

  function toggleProviderCategory(categoryId: string) {
    setProviderForm((current) => {
      const exists = current.categoryIds.includes(categoryId)
      if (exists) {
        const next = current.categoryIds.filter((id) => id !== categoryId)
        return { ...current, categoryIds: next.length > 0 ? next : current.categoryIds }
      }
      return { ...current, categoryIds: [...current.categoryIds, categoryId] }
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Chargement de l&apos;onboarding...
      </div>
    )
  }

  if (!me) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-sm text-muted-foreground">
        Impossible d&apos;identifier l&apos;utilisateur courant pour l&apos;onboarding.
      </div>
    )
  }

  const isClient = me.role === "CLIENT"

  return (
    <div className="h-full overflow-y-auto">
      <PageIntro eyebrow="" title={isClient ? "Onboarding client" : "Onboarding prestataire"} description="" />

      <PageBody className="space-y-6">
        {error ? (
          <Surface className="border-destructive/30 bg-destructive/5">
            <p className="text-sm text-destructive">{error}</p>
          </Surface>
        ) : null}

        {isClient ? (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Surface className="space-y-6">
              <SectionTitle
                title="Comment Mpanera peut vous aider aujourd&apos;hui ?"
                description="Completez votre profil de base, puis explorez les prestataires ou allez directement vers une demande."
              />

              <form className="space-y-6" onSubmit={handleClientSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Prenom</Label>
                    <Input
                      value={clientForm.firstName}
                      onChange={(event) =>
                        setClientForm((current) => ({
                          ...current,
                          firstName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={clientForm.lastName}
                      onChange={(event) =>
                        setClientForm((current) => ({
                          ...current,
                          lastName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      value={clientForm.city}
                      onChange={(event) =>
                        setClientForm((current) => ({
                          ...current,
                          city: event.target.value,
                        }))
                      }
                      placeholder="Antananarivo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input
                      value={clientForm.district}
                      onChange={(event) =>
                        setClientForm((current) => ({
                          ...current,
                          district: event.target.value,
                        }))
                      }
                      placeholder="Analakely"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quartier</Label>
                    <Input
                      value={clientForm.neighborhood}
                      onChange={(event) =>
                        setClientForm((current) => ({
                          ...current,
                          neighborhood: event.target.value,
                        }))
                      }
                      placeholder="Lalana ..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>De quel type de service avez-vous besoin ?</Label>
                  <Select value={selectedNeedId} onValueChange={setSelectedNeedId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    className={`rounded-lg border px-4 py-4 text-left transition-colors ${
                      clientDestination === "explorer"
                        ? "border-primary bg-primary/5"
                        : "border-border/70"
                    }`}
                    onClick={() => setClientDestination("explorer")}
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="size-4" />
                      <p className="font-medium">Mode decouverte</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Parcourez d&apos;abord les prestataires et comparez librement les profils.
                    </p>
                  </button>

                  <button
                    type="button"
                    className={`rounded-lg border px-4 py-4 text-left transition-colors ${
                      clientDestination === "requests"
                        ? "border-primary bg-primary/5"
                        : "border-border/70"
                    }`}
                    onClick={() => setClientDestination("requests")}
                  >
                    <div className="flex items-center gap-2">
                      <SendHorizonal className="size-4" />
                      <p className="font-medium">Publier une demande</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Allez directement vers le parcours de demande pour ce besoin.
                    </p>
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    submitting ||
                    clientForm.firstName.trim().length === 0 ||
                    clientForm.lastName.trim().length === 0
                  }
                >
                  {submitting ? "Enregistrement..." : "Continuer"}
                </Button>
              </form>
            </Surface>

            <Surface className="space-y-4">
              <SectionTitle
                title="Parcours choisi"
                description="Votre premiere experience peut rester exploratoire ou passer directement a l&apos;action."
              />
              <Tag>{clientDestination === "explorer" ? "Decouverte" : "Demande directe"}</Tag>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Service selectionne :
                  <span className="ml-2 font-medium text-foreground">
                    {selectedNeed?.name ?? "Aucune categorie selectionnee"}
                  </span>
                </p>
                <p>
                  Le mode decouverte ouvre la liste des prestataires. La demande
                  directe ouvre le formulaire avec votre categorie deja definie.
                </p>
              </div>
            </Surface>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Surface className="space-y-6">
              <SectionTitle
                title="Configurez votre profil prestataire"
                description="Completez les informations publiques dont les clients ont besoin avant de commencer a recevoir des demandes."
              />

              <form className="space-y-6" onSubmit={handleProviderSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <Input
                      value={providerForm.fullName}
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom de l&apos;entreprise</Label>
                    <Input
                      value={providerForm.companyName}
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          companyName: event.target.value,
                        }))
                      }
                      placeholder="Optionnel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Courte presentation</Label>
                  <Textarea
                    value={providerForm.bio}
                    onChange={(event) =>
                      setProviderForm((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                    placeholder="Decrivez votre service, vos specialites et ce que les clients peuvent attendre."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      value={providerForm.city}
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          city: event.target.value,
                        }))
                      }
                      placeholder="Antananarivo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input
                      value={providerForm.district}
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          district: event.target.value,
                        }))
                      }
                      placeholder="Analakely"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quartier</Label>
                    <Input
                      value={providerForm.neighborhood}
                      onChange={(event) =>
                        setProviderForm((current) => ({
                          ...current,
                          neighborhood: event.target.value,
                        }))
                      }
                      placeholder="Optionnel"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Categories de services</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const active = providerForm.categoryIds.includes(category.id)
                      return (
                        <button
                          key={category.id}
                          type="button"
                          className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                            active
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border text-muted-foreground"
                          }`}
                          onClick={() => toggleProviderCategory(category.id)}
                        >
                          {category.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    submitting ||
                    providerForm.fullName.trim().length === 0 ||
                    providerForm.categoryIds.length === 0
                  }
                >
                  {submitting ? "Enregistrement..." : "Completer le profil"}
                </Button>
              </form>
            </Surface>

            <Surface className="space-y-4">
              <SectionTitle
                title="Et ensuite"
                description="Cet onboarding cree votre profil prestataire en utilisant l'API existante."
              />
              <div className="rounded-lg border border-border/70 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  <p className="font-medium">Apres la configuration du profil</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vous arriverez dans l&apos;espace prestataire, ou les notifications
                  de demande et la gestion des offres pourront commencer.
                </p>
              </div>
              <Tag>{providerForm.categoryIds.length} categories selectionnees</Tag>
            </Surface>
          </div>
        )}
      </PageBody>
    </div>
  )
}
