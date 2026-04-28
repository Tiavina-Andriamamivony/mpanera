# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Mpanera** — marketplace connecting informal service providers (plumbers, repairers, masseurs…) with clients in Madagascar. Next.js 16 App Router + TypeScript + Prisma 7 + PostgreSQL.

> Note: the `README.md` describes a Clerk + Pusher + pnpm stack, but the codebase has diverged. The actual implementation uses **custom JWT auth** (bcrypt + jsonwebtoken with Bearer tokens) and **npm scripts**. There is no Clerk, Pusher, or webhook code in `app/api/`. When in doubt, trust the code over the README.

## Common commands

```bash
npm run dev          # next dev --turbopack
npm run build        # prisma generate && next build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write "**/*.{ts,tsx}"

npm run db:generate  # prisma generate (regenerates client into lib/generated/prisma)
npm run db:migrate   # prisma migrate dev
npm run db:push      # prisma db push (no migration file — dev/prototyping only)
npm run db:studio    # prisma studio
```

There is no test runner configured. After non-trivial changes, run `npm run typecheck` and `npm run lint`. For UI work, start `npm run dev` and verify in browser.

## Architecture

### Layered backend: route → service → prisma

API routes in `app/api/**/route.ts` are thin. They:
1. Authenticate via `getAuthUser(req)` from `lib/auth.ts` (reads `Authorization: Bearer <jwt>`).
2. Validate input with Zod via helpers in `lib/api-error.ts` (`parseJson`, `parseQuery`).
3. Delegate business logic to a service in `lib/services/*.ts`.
4. Return errors via `errorResponse / unauthorized / forbidden / notFound / conflict / badRequest / zodErrorResponse`.

Services own all Prisma calls and domain rules. Routes should not call `prisma` directly — add or extend a service instead. The barrel `lib/services/index.ts` exposes every service.

### Prisma client lives in `lib/generated/prisma`

`prisma/schema.prisma` sets `output = "../lib/generated/prisma"` and uses the **`@prisma/adapter-pg`** driver adapter (Prisma 7). The shared client is `lib/prisma.ts` (singleton via `globalThis`). Domain types are re-exported from `lib/types.ts` — import models and enums (`UserRole`, `JobStatus`, etc.) from there or from `@/lib/services` rather than reaching into `lib/generated/prisma` directly.

`lib/generated/` is generated output. Never hand-edit it; run `npm run db:generate` after schema changes.

### Auth model

Custom JWT, not Clerk (despite `@clerk/nextjs` being in `package.json` and `proxy.ts` containing a `clerkMiddleware` stub — neither is wired into routes). `lib/auth.ts` issues access (15m) + refresh (30d) tokens signed with `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`. The login/register/refresh/logout flow is in `app/api/auth/*`. Passwords are bcrypt-hashed.

The default secrets in `lib/auth.ts` are dev fallbacks — **set both env vars in any non-local environment**.

### Domain model (high level)

Two user roles via `UserRole`: `CLIENT` and `PROVIDER`. A `User` has at most one `Client` or `Provider` profile. The transaction lifecycle:

```
ServiceRequest (client posts a need)
  → Notification (sent to matching providers)
    → Offer (provider proposes price + ProposedTimeSlots)
      → Job (one accepted offer; AWAITING_PAYMENT → PAID → IN_PROGRESS → COMPLETED)
        → Payment (Mvola / Orange Money / Airtel / Card)
        → Review (rating feeds Provider.averageRating)
```

Side flows: `VerificationDocument` (provider KYC) and `UpdateReminder` (re-confirm contact info). When changing this graph, update the corresponding service in `lib/services/` and the route handlers that compose it.

### Frontend client API

`lib/api.ts` is the typed fetch wrapper used by client components. It:
- Reads the access token via a swappable `tokenProvider` (default: `localStorage["accessToken"]`).
- Throws `ApiError` (with `status`, `code`, optional `fields`) on non-2xx — matches the `{ error: { code, message, fields? } }` shape produced by `lib/api-error.ts`.
- Exposes `api.get/post/patch/put/delete/upload`.

Keep error envelopes consistent on both sides: any new route should return errors via the helpers in `lib/api-error.ts` so `ApiError.fields` populates correctly on the client.

### UI conventions

- shadcn/ui (`components.json`: `style: radix-nova`, `baseColor: mauve`, alias `@/components/ui`). Add new primitives via `npx shadcn add <name>` rather than authoring from scratch.
- Tailwind CSS v4 (PostCSS-based, no `tailwind.config.*` — config is in `app/globals.css`).
- `cn` from `@/lib/utils`; `cva` for variants. Both are configured as Tailwind class functions in `.prettierrc`.
- Path alias: `@/*` → repo root.

### Prettier / ESLint specifics

Prettier: `semi: false`, `singleQuote: false`, `printWidth: 80`. `prettier-plugin-tailwindcss` sorts classes (incl. `cn` and `cva` arguments). ESLint extends `next/core-web-vitals` + `next/typescript`.
