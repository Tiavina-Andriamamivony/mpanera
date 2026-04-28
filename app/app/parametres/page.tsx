import {
  BellRing,
  Globe,
  LockKeyhole,
  MapPinned,
  UserRound,
} from "lucide-react"

import {
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
  Tag,
} from "@/components/features/app/page-primitives"

export default function ParametresPage() {
  return (
    <div className="h-full overflow-y-auto">
      <PageIntro
        eyebrow="Parametres"
        title="Ajustez le profil, les alertes et les preferences de navigation."
        description="Cette page expose les principaux controles de personnalisation afin que l&apos;utilisateur garde la maitrise de son experience."
      />

      <PageBody className="space-y-8">
        <div className="grid gap-4 xl:grid-cols-2">
          <Surface className="space-y-4">
            <SectionTitle
              title="Compte et profil"
              description="Informations visibles dans l&apos;application et options essentielles du compte."
            />
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-4">
                <UserRound className="mt-1 size-4 text-primary" />
                <div>
                  <p className="font-medium">Nom, photo, type de compte</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Bloc prevu pour consulter et mettre a jour l&apos;identite
                    affichee.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-4">
                <LockKeyhole className="mt-1 size-4 text-primary" />
                <div>
                  <p className="font-medium">Confidentialite</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Choisissez ce qui est partage, ce qui reste prive et la
                    maniere dont les coordonnees sont revelees.
                  </p>
                </div>
              </div>
            </div>
          </Surface>

          <Surface className="space-y-4">
            <SectionTitle
              title="Alertes et communication"
              description="Parametres qui reglent le rythme des interactions."
            />
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-4">
                <BellRing className="mt-1 size-4 text-primary" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Augmentez ou reduisez les alertes pour les demandes, les
                    messages, les avis et les rappels.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border/70 px-4 py-4">
                <Globe className="mt-1 size-4 text-primary" />
                <div>
                  <p className="font-medium">Langue et affichage</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Langue de l&apos;interface, format horaire et autres preferences
                    de lecture.
                  </p>
                </div>
              </div>
            </div>
          </Surface>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Surface className="space-y-4">
            <SectionTitle
              title="Zone et personnalisation du flux"
              description="Parametres qui aident la plateforme a faire remonter les bons profils et resultats."
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/70 px-4 py-4">
                <div className="flex items-center gap-3">
                  <MapPinned className="size-4 text-primary" />
                  <p className="font-medium">Zone principale</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Adresse ou zone de reference utilisee pour classer les
                  prestataires a proximite.
                </p>
              </div>
              <div className="rounded-lg border border-border/70 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Tag>Feed</Tag>
                  <p className="font-medium">Preferences de services</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Categories suivies, besoins recurrents et historique utiles a
                  la personnalisation.
                </p>
              </div>
            </div>
          </Surface>

          <Surface className="space-y-4">
            <SectionTitle
              title="Actions sensibles"
              description="Zone reservee aux operations rares mais importantes."
            />
            <div className="space-y-3">
              <button className="w-full rounded-lg border border-border px-4 py-3 text-left text-sm font-medium transition-colors">
                Exporter mes donnees
              </button>
              <button className="w-full rounded-lg border border-border px-4 py-3 text-left text-sm font-medium transition-colors">
                Desactiver temporairement mon compte
              </button>
              <button className="w-full rounded-lg border border-red-200 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                Supprimer mon compte
              </button>
            </div>
          </Surface>
        </div>
      </PageBody>
    </div>
  )
}
