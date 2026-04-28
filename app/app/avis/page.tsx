import { MessageCircleHeart, Star, ThumbsUp } from "lucide-react"

import {
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
  Tag,
} from "@/components/features/app/page-primitives"

export default function AvisPage() {
  return (
    <div className="h-full overflow-y-auto">
      <PageIntro
        eyebrow="Avis"
        title="Notez un service termine et suivez les retours deja envoyes."
        description="Cette page permet a l&apos;utilisateur d&apos;evaluer un prestataire, d&apos;ajouter un commentaire et de comprendre comment les avis influencent la reputation visible."
      />

      <PageBody className="space-y-8">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <Surface className="space-y-5">
            <SectionTitle
              title="Avis en attente"
              description="Exemple d&apos;ecran affiche apres la fin d&apos;un service."
            />
            <div className="rounded-lg border border-border/70 bg-muted/20 p-5">
              <p className="text-sm text-muted-foreground">Prestataire concerne</p>
              <h3 className="mt-1 text-xl font-semibold">Felana Rakoto</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Service de plomberie termine aujourd&apos;hui. L&apos;utilisateur peut
                noter la qualite, la ponctualite et la clarte de la communication.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["1 etoile", "2 etoiles", "3 etoiles", "4 etoiles", "5 etoiles"].map(
                  (label) => (
                    <button
                      key={label}
                      className="rounded-full border border-border px-4 py-2 text-sm transition-colors"
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
              <div className="mt-5 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                Zone prevue pour un commentaire libre : deroulement, niveau de
                satisfaction et points a surveiller.
              </div>
              <button className="mt-5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Envoyer l&apos;avis
              </button>
            </div>
          </Surface>

          <Surface className="space-y-4">
            <SectionTitle
              title="Pourquoi cet ecran compte"
              description="Les retours des utilisateurs influencent le classement et la reputation des prestataires."
            />
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <div className="flex items-start gap-3">
                <Star className="mt-1 size-4 text-primary" />
                <p>laisser une note rapide juste apres la fin du service</p>
              </div>
              <div className="flex items-start gap-3">
                <ThumbsUp className="mt-1 size-4 text-primary" />
                <p>aider les profils fiables a mieux ressortir dans les resultats d&apos;exploration</p>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircleHeart className="mt-1 size-4 text-primary" />
                <p>
                  laisser un commentaire utile aux futurs utilisateurs sans
                  imposer un long texte
                </p>
              </div>
            </div>
          </Surface>
        </div>

        <Surface className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle
              title="Historique des avis"
              description="Exemples de retours deja envoyes par l&apos;utilisateur."
            />
            <Tag>3 avis envoyes</Tag>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-lg border border-border/70 px-4 py-4">
              <p className="font-medium">Reparation TV</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Commentaire court, note visible, date et lien vers le profil du
                prestataire.
              </p>
            </div>
            <div className="rounded-lg border border-border/70 px-4 py-4">
              <p className="font-medium">Massage a domicile</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bloc prevu pour relire un avis envoye ou le modifier si les
                regles produit l&apos;autorisent.
              </p>
            </div>
            <div className="rounded-lg border border-border/70 px-4 py-4">
              <p className="font-medium">Reparation plomberie</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Permet aussi d&apos;illustrer ce que l&apos;utilisateur a deja finalise
                sur la plateforme.
              </p>
            </div>
          </div>
        </Surface>
      </PageBody>
    </div>
  )
}
