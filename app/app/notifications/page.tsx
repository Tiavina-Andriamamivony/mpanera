import {
  Bell,
  CircleCheckBig,
  MessageSquareMore,
  TriangleAlert,
} from "lucide-react"

import {
  PageBody,
  PageIntro,
  SectionTitle,
  Surface,
  Tag,
} from "@/components/features/app/page-primitives"

export default function NotificationsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <PageIntro
        eyebrow="Notifications"
        title="Rassemblez les alertes importantes pour que l&apos;utilisateur sache toujours quoi faire ensuite."
        description="Les notifications doivent pousser a l&apos;action : ouvrir un message, consulter une reponse, laisser un avis ou confirmer une etape."
      />

      <PageBody className="space-y-8">
        <Surface className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle
              title="Centre de notifications"
              description="Une vue facile a lire avec differents niveaux de priorite."
            />
            <div className="flex flex-wrap gap-2">
              <Tag>Toutes</Tag>
              <Tag>Non lues</Tag>
              <Tag>Demandes</Tag>
              <Tag>Messages</Tag>
              <Tag>Avis</Tag>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-4 rounded-lg border border-border/70 px-4 py-4">
              <Bell className="mt-1 size-4 text-primary" />
              <div className="space-y-1">
                <p className="font-medium">
                  Nouvelle reponse a votre demande de plomberie
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Un prestataire a confirme sa disponibilite. L&apos;action attendue
                  consiste a ouvrir la demande et comparer.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border/70 px-4 py-4">
              <MessageSquareMore className="mt-1 size-4 text-primary" />
              <div className="space-y-1">
                <p className="font-medium">
                  Message non lu dans une conversation active
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  L&apos;utilisateur doit pouvoir ouvrir directement le fil de
                  conversation concerne.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border/70 px-4 py-4">
              <CircleCheckBig className="mt-1 size-4 text-primary" />
              <div className="space-y-1">
                <p className="font-medium">
                  Service termine, avis attendu
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Notification post-service menant vers l&apos;ecran d&apos;evaluation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border/70 px-4 py-4">
              <TriangleAlert className="mt-1 size-4 text-primary" />
              <div className="space-y-1">
                <p className="font-medium">Une action expire bientot</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Exemple d&apos;alerte pour eviter qu&apos;une demande ou une reponse ne
                  reste sans suite.
                </p>
              </div>
            </div>
          </div>
        </Surface>

        <div className="grid gap-4 lg:grid-cols-2">
          <Surface className="space-y-3">
            <SectionTitle
              title="Ce que l&apos;utilisateur peut faire"
              description="Chaque notification doit mener a une destination concrete."
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Ouvrir une demande, entrer dans une conversation, consulter un
              profil, terminer un avis ou ajuster les preferences d&apos;alerte.
            </p>
          </Surface>
          <Surface className="space-y-3">
            <SectionTitle
              title="Preferences d&apos;envoi"
              description="Zone prevue pour choisir les canaux et la frequence."
            />
            <p className="text-sm leading-6 text-muted-foreground">
              Notifications dans l&apos;application, email, rappels prioritaires,
              alertes silencieuses et categories suivies.
            </p>
          </Surface>
        </div>
      </PageBody>
    </div>
  )
}
