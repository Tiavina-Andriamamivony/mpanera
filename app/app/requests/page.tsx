"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock3, Loader, Send, XCircle } from "lucide-react"

import {
  ActionLink,
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
  Tag,
} from "@/components/features/app/page-primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { categoriesService, serviceRequestsService } from "@/lib/services"
import {
  type Category,
  type ServiceRequest,
} from "@/lib/generated/prisma/client"
import { MOCK_CATEGORIES } from "@/lib/mock-categories"
import type {
  CategoryWithChildren,
  CreateServiceRequestBody,
} from "@/types/api"

const SERVICE_REQUEST_STATUS = {
  OPEN: "OPEN",
  NEGOTIATING: "NEGOTIATING",
  ASSIGNED: "ASSIGNED",
  CLOSED: "CLOSED",
  EXPIRED: "EXPIRED",
} as const

const statusMeta = {
  [SERVICE_REQUEST_STATUS.OPEN]: {
    label: "En attente",
    icon: Clock3,
    tone: "Les prestataires ont ete notifies et les reponses sont en attente.",
  },
  [SERVICE_REQUEST_STATUS.NEGOTIATING]: {
    label: "Reponses recues",
    icon: Send,
    tone: "Au moins une proposition a deja ete recue.",
  },
  [SERVICE_REQUEST_STATUS.ASSIGNED]: {
    label: "Acceptee",
    icon: CheckCircle2,
    tone: "Le contact direct peut maintenant avoir lieu.",
  },
  [SERVICE_REQUEST_STATUS.CLOSED]: {
    label: "Fermee",
    icon: XCircle,
    tone: "Demande terminee ou archivee.",
  },
  [SERVICE_REQUEST_STATUS.EXPIRED]: {
    label: "Fermee",
    icon: XCircle,
    tone: "La demande a expire sans etre finalisee.",
  },
} as const

type RequestFormState = {
  categoryId: string
  title: string
  description: string
  district: string
  budget: string
  desiredDeadline: string
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

function buildRequestBody(form: RequestFormState): {
  body: CreateServiceRequestBody | null
  errors: string[]
} {
  const title = form.title.trim()
  const description = form.description.trim()
  const district = form.district.trim()
  const budget = form.budget.trim()

  const errors: string[] = []

  if (!form.categoryId) errors.push("La categorie est obligatoire.")
  if (title.length === 0) errors.push("Le titre est obligatoire.")
  if (description.length === 0) errors.push("La description est obligatoire.")
  if (district.length === 0) errors.push("Le district est obligatoire.")

  let indicativeBudget: number | undefined
  if (budget.length > 0) {
    indicativeBudget = Number(budget)
    if (!Number.isFinite(indicativeBudget) || indicativeBudget < 0) {
      errors.push("Le budget doit etre un nombre positif.")
    }
  }

  let desiredDeadline: string | undefined
  if (form.desiredDeadline) {
    const parsedDeadline = new Date(form.desiredDeadline)
    if (Number.isNaN(parsedDeadline.getTime())) {
      errors.push("L'echeance est invalide.")
    } else {
      desiredDeadline = form.desiredDeadline
    }
  }

  if (errors.length > 0) {
    return { body: null, errors }
  }

  return {
    body: {
      categoryId: form.categoryId,
      title,
      description,
      district,
      indicativeBudget,
      desiredDeadline,
    },
    errors,
  }
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<RequestFormState>({
    categoryId: "",
    title: "",
    description: "",
    district: "",
    budget: "",
    desiredDeadline: "",
  })

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [requestsResponse, categoriesResponse] = await Promise.all([
          serviceRequestsService.list(),
          categoriesService.list(),
        ])

        if (cancelled) return

        const flatCategories = flattenCategories(categoriesResponse)
        const availableCategories =
          flatCategories.length > 0
            ? flatCategories
            : [...MOCK_CATEGORIES]
        setRequests(requestsResponse.data)
        setCategories(availableCategories)
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || availableCategories[0]?.id || "",
        }))
      } catch (err) {
        if (cancelled) return
        setRequests([])
        setCategories(MOCK_CATEGORIES as Category[])
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || MOCK_CATEGORIES[0]?.id || "",
        }))
        setError(
          err instanceof Error
            ? `${err.message} Chargement des categories fictives en secours.`
            : "Impossible de charger les donnees des demandes. Chargement des categories fictives en secours."
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [])

  const requestsByStatus = useMemo(
    () => ({
      all: requests,
      pending: requests.filter(
        (request) => request.status === SERVICE_REQUEST_STATUS.OPEN
      ),
      received: requests.filter(
        (request) => request.status === SERVICE_REQUEST_STATUS.NEGOTIATING
      ),
      accepted: requests.filter(
        (request) => request.status === SERVICE_REQUEST_STATUS.ASSIGNED
      ),
      closed: requests.filter(
        (request) =>
          request.status === SERVICE_REQUEST_STATUS.CLOSED ||
          request.status === SERVICE_REQUEST_STATUS.EXPIRED
      ),
    }),
    [requests]
  )

  const requestDraft = useMemo(() => buildRequestBody(form), [form])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { body, errors } = requestDraft

    if (!body) {
      setError(errors.join(" "))
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      console.info("Creating service request with body:", body)
      const createdRequest = await serviceRequestsService.create(body)
      setRequests((current) => [createdRequest, ...current])
      setForm((current) => ({
        ...current,
        title: "",
        description: "",
        district: "",
        budget: "",
        desiredDeadline: "",
      }))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de creer la demande."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <PageIntro
        eyebrow=""
        title="Demandes de service"
        description=""
        actions={<ActionLink href="/app/explorer">Retour a l&apos;exploration</ActionLink>}
      />

      <PageBody className="space-y-8">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Surface className="space-y-5">
            <SectionTitle
              title="Nouvelle demande"
              description="Le client decrit son besoin puis selectionne un ou plusieurs prestataires."
            />
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <Label>Categorie</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        categoryId: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selectionner une categorie" />
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
                <div className="space-y-2 text-sm">
                  <Label>Quartier / district</Label>
                  <Input
                    value={form.district}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        district: event.target.value,
                      }))
                    }
                    placeholder="Analakely"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <Label>Titre</Label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Exemple : fuite sous l'evier de la cuisine"
                  required
                />
              </div>

              <div className="space-y-2 text-sm">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Decrivez le probleme, l'urgence et toute information utile pour le prestataire."
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <Label>Budget indicatif</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        budget: event.target.value,
                      }))
                    }
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <Label>Date souhaitee</Label>
                  <Input
                    type="date"
                    value={form.desiredDeadline}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        desiredDeadline: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Envoi automatique</p>
                    <p className="text-sm text-muted-foreground">
                      Une fois creee, la demande est envoyee automatiquement
                      aux prestataires verifies correspondant a la categorie et
                      au district selectionnes.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Aucune selection manuelle de prestataire n&apos;est necessaire
                      dans ce parcours MVP.
                    </p>
                    {categories.some((category) =>
                      MOCK_CATEGORIES.some((mock) => mock.id === category.id)
                    ) ? (
                      <p className="mt-1 text-xs text-amber-600">
                        Des categories fictives sont actuellement chargees pour la selection.
                      </p>
                    ) : null}
                  </div>
                  <Tag>Auto</Tag>
                </div>
              </div>

              {/* <div className="rounded-xl border border-border/70 bg-background p-4">
                <p className="font-medium">Request body preview</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This is the payload verified before the creation request is
                  sent.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/40 p-3 text-xs text-foreground">
                  {JSON.stringify(requestDraft.body, null, 2)}
                </pre>
                {requestDraft.errors.length > 0 ? (
                  <p className="mt-2 text-xs text-destructive">
                    {requestDraft.errors.join(" ")}
                  </p>
                ) : null}
              </div> */}

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || requestDraft.body === null}
              >
                {submitting ? "Envoi..." : "Creer la demande"}
              </Button>
            </form>
          </Surface>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
          <Surface className="space-y-4">
            <SectionTitle
              title="Suivi des demandes"
              description="Le client peut voir les reponses, les offres acceptees et les demandes fermees."
            />
            {error ? (
              <div className="rounded-lg border border-dashed border-destructive/30 px-4 py-4 text-sm text-destructive/50">
                <div className="flex flex-col items-center gap-2">
                  <Loader className="animate-spin" />
                  <span className="text-desctructive">Veuillez patienter...</span>
                </div>
              </div>
            ) : null}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-2" variant="line">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="received">Reponses recues</TabsTrigger>
                <TabsTrigger value="accepted">Acceptees</TabsTrigger>
                <TabsTrigger value="closed">Fermees</TabsTrigger>
              </TabsList>
              {Object.entries(requestsByStatus).map(([tab, items]) => (
                <TabsContent key={tab} className="space-y-3" value={tab}>
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                      {loading
                        ? "Chargement des demandes..."
                        : "Aucune demande dans cet etat pour le moment."}
                    </div>
                  ) : (
                    items.map((request) => {
                      const meta = statusMeta[request.status]
                      const Icon = meta.icon
                        const categoryName =
                          categories.find(
                            (category) => category.id === request.categoryId
                        )?.name || "Categorie inconnue"

                      return (
                        <article
                          key={request.id}
                          className="rounded-xl border border-border/70 px-4 py-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-3">
                              <div className="h-fit rounded-lg border border-secondary/50 bg-secondary/10 p-2 text-muted-foreground">
                                <Icon className="size-4 text-secondary" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium text-foreground">
                                    {request.title}
                                  </p>
                                  <Tag>{meta.label}</Tag>
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                  {request.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {categoryName} a{" "}
                                  {request.district || "zone non precisee"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground lg:max-w-64">
                              <p>{meta.tone}</p>
                              <p>
                                {new Intl.DateTimeFormat("fr-FR", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }).format(new Date(request.createdAt))}
                              </p>
                              {request.desiredDeadline ? (
                                <p>
                                  Echeance :{" "}
                                  {new Intl.DateTimeFormat("fr-FR", {
                                    dateStyle: "medium",
                                  }).format(new Date(request.desiredDeadline))}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      )
                    })
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </Surface>

          <Surface className="space-y-4">
            <SectionTitle
              title="Parcours MVP"
              description="Les etapes decrites dans le README sont maintenant representees dans l'interface."
            />
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 px-4 py-4">
                <p className="font-medium">1. Creation</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Le client renseigne la categorie, le besoin, la localisation,
                  le budget et la date souhaitee.
                </p>
              </div>
              <div className="rounded-lg border border-border/70 px-4 py-4">
                <p className="font-medium">2. Diffusion</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  L&apos;API diffuse maintenant la demande automatiquement aux
                  prestataires verifies correspondant a la categorie et au district.
                </p>
              </div>
              <div className="rounded-lg border border-border/70 px-4 py-4">
                <p className="font-medium">3. Decision</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Les statuts aident ensuite le client a suivre les reponses,
                  accepter une proposition ou cloturer la demande.
                </p>
              </div>
            </div>
          </Surface>
        </div>
      </PageBody>
    </div>
  )
}
