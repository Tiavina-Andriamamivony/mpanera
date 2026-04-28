# Mpanera

> **Mpanera** — connecteur de prestataires informels et de leurs futurs clients à Madagascar.

Mpanera est une Plateforme qui donne un cadre, une visibilité et une réputation aux acteurs de l'économie informelle de services : le réparateur de télé, le professionnel du massage, le plombier de quartier. N'importe qui ayant un talent peut créer son profil. N'importe qui ayant un besoin peut trouver le bon prestataire, au bon endroit, avec les bonnes notes.

---

## Pourquoi ce projet ?

95 % de l'emploi à Madagascar est informel et fragmenté _(Banque africaine de développement, 2025)_. Ces travailleurs ont des compétences réelles mais aucun cadre pour les valoriser : pas de visibilité, pas de réputation portable, pas de moyen d'être trouvé en dehors de son quartier. Mpanera est le chaînon manquant.

---

## Stack technique

| Couche                | Technologie                     |
| --------------------- | ------------------------------- |
| Framework             | Next.js 16 (App Router)         |
| Langage               | TypeScript                      |
| ORM                   | Prisma                          |
| Authentification      | Clerk (Google + Facebook OAuth) |
| Messagerie temps réel | WebSocket (Pusher ou Ably)      |
| UI                    | shadcn/ui + Tailwind CSS v4     |
| Icônes                | Lucide React                    |
| Déploiement           | Vercel                          |
| Package manager       | pnpm                            |

> **Pourquoi Pusher/Ably et pas un serveur WebSocket maison ?** Vercel déploie des fonctions serverless qui ne maintiennent pas de connexions persistantes. Un service WebSocket managé (Pusher ou Ably) s'intègre nativement à cette contrainte sans infrastructure supplémentaire.

---

## Fonctionnalités (MVP)

### Authentification

- Connexion et inscription via Google ou Facebook (Clerk)
- Choix du rôle à la première connexion : client ou prestataire
- Profil automatiquement créé en base via webhook Clerk

### Onboarding & découverte (client)

- Formulaire d'accueil : "Comment Mpanera peut vous aider aujourd'hui ?" avec choix du type de service
- Parcours découverte : navigation libre des profils prestataires sans remplir le formulaire
- Liste de prestataires triée par note (étoiles) et par distance

### Profil prestataire

- Création et édition du profil : nom, compétences, localisation, tarif indicatif, photo
- Page profil publique visible sans connexion
- Score de réputation affiché (moyenne des notes reçues)

### Demandes de prestation

- Envoi d'une demande à un ou plusieurs prestataires simultanément, le client ne choisit pas le prestataire, il n'a qu'a diffuser sa demande
- Notification push au prestataire à la réception d'une demande
- Le prestataire accepte ou refuse la demande
- Si accepté : mise en contact directe via notification

### Évaluation

- Formulaire de satisfaction envoyé au client après la prestation
- Attribution d'une note en étoiles (1 à 5) au prestataire
- La note alimente le score de classement du prestataire

### Feed

- Fil personnalisé pour le client basé sur ses recherches et évaluations passées
- Mise à jour du feed après chaque nouvelle évaluation

---

> **Hors MVP (V2+)** : paiement in-app Mobile Money, badge "prestataire vérifié", statistiques avancées prestataire, algorithme de feed poussé.

---

## Structure du projet

```
mpanera/
├── app/                        # Routes Next.js (App Router)
│   ├── (auth)/                 # Pages d'authentification Clerk
│   │   ├── sign-in/            # Page de connexion (Google / Facebook)
│   │   └── sign-up/            # Page d'inscription
│   ├── (client)/               # Espace client (protégé)
│   │   ├── page.tsx            # Accueil / formulaire de besoin
│   │   ├── prestataires/       # Liste et profils prestataires
│   │   └── messages/           # Messagerie temps réel
│   ├── (prestataire)/          # Espace prestataire (protégé)
│   │   ├── profil/             # Gestion du profil
│   │   ├── demandes/           # Demandes reçues
│   │   └── messages/           # Messagerie temps réel
│   └── api/
│       ├── webhooks/
│       │   └── clerk/          # Webhook Clerk → sync utilisateur en BDD
│       └── messages/           # Route handler pour persister les messages
├── components/
│   ├── ui/                     # Composants shadcn/ui
│   ├── auth/                   # Composants liés à Clerk
│   └── chat/                   # Composants de messagerie WebSocket
├── hooks/
│   └── useChat.ts              # Hook WebSocket pour la messagerie
├── lib/
│   ├── prisma.ts               # Instance Prisma (singleton)
│   ├── pusher.ts               # Client Pusher/Ably (serveur)
│   ├── pusher-client.ts        # Client Pusher/Ably (navigateur)
│   └── utils.ts                # Utilitaires (cn, etc.)
├── middleware.ts               # Middleware Clerk (protection des routes)
├── prisma/
│   └── schema.prisma           # Schéma de base de données
└── public/                     # Assets statiques
```

---

## Installation locale

### Prérequis

- Node.js ≥ 18
- pnpm ≥ 9
- Une base de données PostgreSQL (locale ou distante)

### 1. Cloner le dépôt

```bash
git clone https://github.com/Tiavina-Andriamamivony/mpanera.git
cd mpanera
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Copier le fichier d'exemple et le remplir :

```bash
cp .env.example .env
```

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/mpanera"

# Clerk — récupérer sur https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Redirections Clerk après connexion/déconnexion
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Webhook Clerk (pour synchroniser les utilisateurs en BDD)
CLERK_WEBHOOK_SECRET="whsec_..."

# Pusher — récupérer sur https://dashboard.pusher.com
PUSHER_APP_ID="..."
PUSHER_APP_KEY="..."
PUSHER_APP_SECRET="..."
PUSHER_CLUSTER="..."
NEXT_PUBLIC_PUSHER_APP_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="..."
```

### 4. Initialiser la base de données

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

### 5. Lancer le serveur de développement

```bash
pnpm dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Commande                  | Description                               |
| ------------------------- | ----------------------------------------- |
| `pnpm dev`                | Serveur de développement (Turbopack)      |
| `pnpm build`              | Build de production                       |
| `pnpm start`              | Serveur de production                     |
| `pnpm lint`               | Vérification ESLint                       |
| `pnpm format`             | Formatage Prettier                        |
| `pnpm typecheck`          | Vérification TypeScript                   |
| `pnpm prisma studio`      | Interface visuelle de la base de données  |
| `pnpm prisma migrate dev` | Appliquer les migrations en développement |

---

## Déploiement sur Vercel

Le projet est conçu pour un déploiement direct sur Vercel.

### 1. Importer le projet

Connecter le dépôt GitHub sur [vercel.com/new](https://vercel.com/new).

### 2. Configurer les variables d'environnement

Dans les paramètres du projet Vercel, ajouter toutes les variables du fichier `.env` :

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
CLERK_WEBHOOK_SECRET
PUSHER_APP_ID
PUSHER_APP_KEY
PUSHER_APP_SECRET
PUSHER_CLUSTER
NEXT_PUBLIC_PUSHER_APP_KEY
NEXT_PUBLIC_PUSHER_CLUSTER
```

> Pour la base de données en production, utiliser un fournisseur PostgreSQL compatible Vercel : **Neon**, **Supabase** ou **PlanetScale**.

### 3. Configurer le webhook Clerk

Clerk doit notifier l'application à chaque création/modification d'utilisateur pour synchroniser les données en base. Dans le dashboard Clerk :

1. Aller dans **Webhooks → Add Endpoint**
2. URL : `https://votre-domaine.vercel.app/api/webhooks/clerk`
3. Événements à écouter : `user.created`, `user.updated`, `user.deleted`
4. Copier le **Signing Secret** dans la variable `CLERK_WEBHOOK_SECRET`

### 4. Déployer

Vercel détecte automatiquement Next.js. Chaque push sur `main` déclenche un déploiement automatique.

---

## Authentification (Clerk)

Clerk gère l'intégralité du flux d'authentification. Les providers Google et Facebook sont activés depuis le dashboard Clerk sans configuration OAuth manuelle.

La protection des routes est centralisée dans `middleware.ts` :

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/prestataires(.*)',    // profils publics visibles sans connexion
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

Lors de la première connexion, le webhook Clerk déclenche la création de l'utilisateur dans la base Prisma, ce qui permet de lier les données métier (profil, messages, évaluations) à l'identité Clerk.

---

**Abonnement côté client :**

```ts
// hooks/useChat.ts
import Pusher from 'pusher-js'

export function useChat(conversationId: string) {
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`conversation-${conversationId}`)
    channel.bind('new-message', (data: Message) => {
      // mettre à jour l'état local
    })

    return () => pusher.unsubscribe(`conversation-${conversationId}`)
  }, [conversationId])
}
```

---

## Parcours utilisateur

```
Accueil
  ├── [Formulaire de besoin] ──→ Liste prestataires (triée par note + distance)
  │                                   └── Demande envoyée
  │                                         └── Prestataire notifié
  │                                               ├── Accepte → Mise en contact -> envoi offre (prestataire) -> comparaison prix (client) -> payment frais de contact -> reçoit le contact du prestataire
  │                                               └── Refuse  → Prochain prestataire
  │                                                               └── Prestation réalisée
  │                                                                     └── Évaluation → Feed mis à jour
  └── [Parcours découverte] ──→ Profils en navigation libre
```

---

## Contribuer

1. Forker le projet
2. Créer une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commiter les changements : `git commit -m 'feat: description claire'`
4. Pousser : `git push origin feature/ma-fonctionnalite`
5. Ouvrir une Pull Request

---

## Auteur

**Tiavina-Andriamamivony** — [github.com/Tiavina-Andriamamivony](https://github.com/Tiavina-Andriamamivony)

---

_Mpanera — donne un cadre à ceux qui ont le talent._
