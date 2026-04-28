import { Search } from "lucide-react"

import {
  ActionLink,
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
  Tag,
} from "@/components/features/app/page-primitives"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

const threads = [
  {
    name: "Felana Rakoto",
    preview: "Je peux passer cet apres-midi vers 15 h.",
    state: "En ligne",
  },
  {
    name: "Tovo Care",
    preview: "Pouvez-vous confirmer votre quartier exact ?",
    state: "En attente",
  },
  {
    name: "Mamy Tech",
    preview: "Merci pour la photo, je prepare un devis.",
    state: "Archive recente",
  },
]

export default function MessagesPage() {
  return (
    <div className="h-full overflow-y-auto">
      <PageIntro
        eyebrow="Messages"
        title="Discutez avec un prestataire une fois la demande acceptee."
        description="La messagerie aide l'utilisateur a preciser le besoin, confirmer une visite et garder une trace claire des echanges importants."
        actions={
          <>
            <ActionLink href="/app/requests">Voir les demandes</ActionLink>
          </>
        }
      />

      <PageBody>
        <div className="">
          <Surface className="mx-auto max-w-2xl space-y-4">
            <SectionTitle
              title="Conversations"
              description="Liste des discussions actives ou recentes."
            />
            <InputGroup>
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                size={10}
                placeholder="Rechercher un prestataire ou un mot-cle"
              />
            </InputGroup>

            <div className="space-y-3">
              {threads.map((thread) => (
                <div
                  key={thread.name}
                  className="rounded-lg border border-border/70 px-4 py-4 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{thread.name}</p>
                    <Tag>{thread.state}</Tag>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {thread.preview}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </PageBody>
    </div>
  )
}
