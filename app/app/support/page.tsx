import { CircleHelp, FileWarning, LifeBuoy, ShieldAlert } from "lucide-react"

import {
  ActionLink,
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
} from "@/components/features/app/page-primitives"

export default function SupportPage() {
  return (
    <div className="h-full overflow-y-auto">
      <PageIntro
        eyebrow="Support"
        title="Aidez l'utilisateur a resoudre une demande bloquee, un probleme de conversation ou un souci de compte."
        description="Le support ne doit pas etre seulement un formulaire. Il doit aussi offrir des acces rapides vers l'aide la plus utile."
        actions={
          <ActionLink href="/app/parametres">Gerer les preferences</ActionLink>
        }
      />

      <PageBody className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <Surface className="space-y-3">
            <LifeBuoy className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Aide rapide</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Acces direct aux blocages frequents : absence de reponse a une
              demande, messages manquants ou incomprehension d&apos;une etape.
            </p>
          </Surface>
          <Surface className="space-y-3">
            <ShieldAlert className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Signaler un comportement</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Zone prevue pour signaler des litiges, abus, fraudes ou profils
              problematiques.
            </p>
          </Surface>
          <Surface className="space-y-3">
            <FileWarning className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Suivre un dossier support</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Historique du ticket, priorite et statut de traitement actuel une
              fois le support contacte.
            </p>
          </Surface>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Surface className="space-y-4">
            <SectionTitle
              title="Questions frequentes"
              description="Contenu utile a afficher avant d&apos;ouvrir un canal de support humain."
            />
            <div className="space-y-3">
              {[
                "Comment envoyer une demande a plusieurs prestataires ?",
                "Que faire si personne ne repond ?",
                "Quand puis-je laisser un avis ?",
                "Comment signaler un profil ou un message ?",
              ].map((question) => (
                <div
                  key={question}
                  className="rounded-lg border border-border/70 px-4 py-4 text-sm font-medium transition-colors hover:bg-muted/20"
                >
                  {question}
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="space-y-4">
            <SectionTitle
              title="Contacter le support"
              description="Apercu du formulaire utilise pour decrire un probleme."
            />
            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                Sujet du support
              </div>
              <div className="rounded-lg border border-border bg-background px-4 py-3">
                Numero de demande ou de conversation lie
              </div>
              <div className="min-h-32 rounded-lg border border-dashed border-border bg-background px-4 py-3">
                Description du probleme, captures d&apos;ecran, date de l&apos;incident
              </div>
              <button className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Envoyer au support
              </button>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-4 text-sm text-muted-foreground">
              <CircleHelp className="mt-1 size-4 text-primary" />
              Le formulaire devra ensuite proposer un suivi simple : recu, en
              cours, resolu.
            </div>
          </Surface>
        </div>
      </PageBody>
    </div>
  )
}
