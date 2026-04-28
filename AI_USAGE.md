# AI_USAGE.md

Ce document décrit comment Claude Code (et les autres assistants IA) sont utilisés sur le projet **Mpanera**, ce que l'IA fait, ce qu'elle ne fait pas, et comment l'humain garde le contrôle.

## 1. Pourquoi ce document existe

Mpanera traite des données personnelles (identité, géolocalisation, paiements Mobile Money, documents KYC). À ce titre :

- Toute contribution issue d'un assistant IA doit être traçable.
- Aucun secret ni donnée de production ne doit transiter par un prompt.
- Les responsabilités humain / IA sont explicites pour éviter le « blame shifting » en cas d'incident.

## 2. Outil principal

| Outil | Rôle |
|---|---|
| **Claude Code (Anthropic)** | Assistant principal pour le développement, la revue, la documentation. |
| **Claude API / SDK** | Pas utilisé en runtime applicatif à ce jour. Si introduit, il devra apparaître dans `package.json` (`@anthropic-ai/sdk`) et faire l'objet d'une note dans ce fichier. |

Les fichiers `CLAUDE.md` (à la racine) et le dossier `.claude/` configurent le comportement de l'assistant pour ce repo. Les agents personnalisés que j'invoque (Explore, Plan, code-reviewer, senior-backend-engineer, visual-identity-frontend, security-review…) sont définis côté harness, pas dans le code applicatif.

## 3. Ce que l'IA fait dans ce projet

### 3.1 Implémentation

- Écriture de **route handlers** Next.js dans `app/api/**` en suivant le pattern *route → service → prisma* documenté dans `CLAUDE.md`.
- Écriture de **services métier** dans `lib/services/**` (logique d'orchestration Prisma + règles domaine).
- Évolution du **schéma Prisma** (`prisma/schema.prisma`) accompagnée de la commande `npm run db:generate` et d'une migration nommée.
- Écriture de **composants UI** basés sur shadcn/ui + Tailwind v4 (alias `@/components/ui`, fonction `cn`, variants `cva`).
- Configuration ponctuelle : ESLint, Prettier, `tsconfig.json`, scripts `package.json`.

### 3.2 Tests

- Écriture des **tests Vitest** dans `tests/` (BDD Postgres réelle de test, voir `CLAUDE.md`).
- Génération de fixtures (`tests/fixtures/*`) et helpers (`tests/utils/*`).
- L'IA n'**ajoute pas** de test qu'elle ne sait pas faire passer localement.

### 3.3 Documentation

- `CLAUDE.md` : guide d'orientation pour les futures sessions (commandes, archi, divergences avec README).
- Ce fichier `AI_USAGE.md`.
- Mise à jour ciblée du `README.md` lorsqu'il diverge significativement du code (sur demande explicite).
- L'IA évite de créer des `.md` non demandés (no `NOTES.md`, `TODO.md`, `ARCHITECTURE.md` spontanés).

### 3.4 Revue & sécurité

- Revue de code via l'agent `code-reviewer` après les changements non triviaux.
- Revue de sécurité via la skill `/security-review` avant les PR qui touchent : auth, paiements, validation d'entrée, webhooks, KYC.
- Détection des vulnérabilités OWASP courantes (injection SQL via Prisma raw, XSS, CSRF sur routes mutantes, fuite de secrets dans les logs).

### 3.5 Opérations Git

- Création de commits **uniquement quand l'humain le demande explicitement**.
- Création de PR via `gh pr create` sur demande.
- **Jamais** de `git push --force`, `git reset --hard`, `--no-verify`, ni de modification de `git config` sans confirmation.
- Co-signature des commits :
  ```
  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

## 4. Ce que l'IA ne fait pas (ou seulement avec accord explicite)

- ❌ Pousser sur `main`, fusionner une PR, fermer une issue.
- ❌ Toucher à `.env`, `.env.production`, ni à un secret réel.
- ❌ Lancer une migration sur une BDD de production.
- ❌ Installer des dépendances non discutées (chaque ajout à `package.json` est mentionné en clair).
- ❌ Désactiver un test pour faire passer la CI.
- ❌ Créer un `--amend` qui réécrit un commit publié.
- ❌ Stocker des données utilisateur réelles dans un prompt ou un fichier de test.

## 5. Garde-fous côté code

| Risque | Mitigation |
|---|---|
| Secret commité | `.env` est dans `.gitignore` ; seul `.env.example` est versionné. Toute clé qui apparaît dans une suggestion IA doit être un placeholder (`pk_test_…`, `whsec_…`). |
| Drift README ↔ code | `CLAUDE.md` documente explicitement les divergences (Clerk + Pusher décrits dans le README mais non implémentés). L'IA suit le code, pas le README. |
| Code généré non testé | `npm run typecheck` + `npm run lint` après tout changement non trivial. Pour l'UI, validation visuelle via `npm run dev`. Pour les routes API, suite Vitest. |
| Hallucination de symboles | Avant de recommander un fichier / fonction depuis la mémoire ou une session précédente, l'IA vérifie son existence (`Grep`, `Read`). |
| Sur-ingénierie | Pas d'abstraction « au cas où », pas de feature flags spéculatifs, pas de validation au-delà des frontières (entrée utilisateur, API externe). |

## 6. Données et confidentialité

- **Aucune donnée client réelle** ne doit être collée dans un prompt. Pour reproduire un bug, créer un fixture anonymisé dans `tests/fixtures/`.
- Les données de test sont générées (UUIDs, faux numéros au format `+261…`, faux emails `@example.test`).
- Les payloads des webhooks de paiement (Mvola, Orange Money, Airtel) qui apparaissent dans les tests sont **synthétiques**.

## 7. Limites assumées

- L'IA peut se tromper sur l'état d'une dépendance externe (statut d'un service Mobile Money, comportement exact d'un SDK). Toute intégration externe nouvelle est validée par un humain avec la documentation officielle ouverte à côté.
- L'IA ne remplace pas la revue humaine sur : modèles de paiement, calcul de frais, politique de remboursement, gestion des litiges (`JobStatus.DISPUTED`).
- Le score de réputation (`Provider.averageRating`) et son algorithme sont du ressort produit ; l'IA n'en modifie pas la formule sans demande explicite.

## 8. Comment contribuer avec l'IA

1. Décris l'intention métier, pas seulement la tâche technique. Exemple : « un client doit pouvoir refuser une offre sans clore la demande » plutôt que « ajoute une route PATCH ».
2. Pointe les fichiers ou modèles concernés si tu les connais (`lib/services/offers.ts`, `OfferStatus`).
3. Pour les changements de schéma, indique si une migration doit être créée (`prisma migrate dev --name …`) ou si un `db push` suffit (prototype).
4. Demande la revue (`/review`) ou la revue sécurité (`/security-review`) avant de fusionner une PR sensible.

---

*Ce fichier est maintenu manuellement. Toute évolution majeure du rôle de l'IA dans le projet (nouvel outil, nouvel agent, nouvelle limitation) doit y être consignée.*
