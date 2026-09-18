# Project Documentation

## Architecture Overview
- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Styling:** Tailwind CSS v3 + Shadcn UI
- **State:** Zustand (client) + TanStack Query v5 (server)
- **Forms:** React Hook Form + Zod
- **Animation:** Framer Motion
- **Payments:** eSewa, Khalti, FonePay (Nepal)

## Documentation Index
- **`docs/ai-collab/README.md`** — Overview and how to use the AI-collaboration docs folder
- **`docs/ai-collab/HANDOVER.md`** — Live session state; read first, update last
- **`docs/ai-collab/DECISIONS.md`** — Architecture and design decisions (ADR-style)
- **`docs/ai-collab/FLOW.md`** — User flows and data flows
- **`docs/ai-collab/ARCHITECTURE.md`** — System architecture, layers, and patterns
- **`docs/ai-collab/CONSTRAINTS.md`** — Hard constraints, coding rules, and guardrails
- **`docs/ai-collab/TEST_CHECKLIST.md`** — Test scenarios and verification checklist
- **`docs/ai-collab/ROLLBACK.md`** — Rollback procedures and incident response
- **`docs/supabase-setup.md`** — Supabase project creation, schema migration, and RLS verification

## Day 1 — Project Scaffolding

### 1.1 Config Files
- `package.json` — pinned to Next.js 14 + React 18 compatible versions (tailwind v3, zod v3, typescript 5, zxing-wasm v3, jspdf-autotable v3.7.1, nepali-date 0.1.3)
- `tsconfig.json` — strict mode, `moduleResolution: "bundler"`, `@/*` path alias
- `tailwind.config.ts` — custom breakpoints (sm 414px, md 640px, lg 1024px, xl 1280px), shadcn theme variables
- `next.config.js`, `postcss.config.mjs`, `.eslintrc.js` (next/core-web-vitals + prettier)
- `.env.local.example` — 12 keys across Supabase, payment gateways, and app
- `.gitignore` — excludes `.env.local`, `.env*.local`, `node_modules`, `.next/`, `*.tsbuildinfo`

### 1.2 Folder Structure
Created all required folders with placeholder `index.ts` files:
- `src/app/(auth)/login/`, `src/app/(dashboard)/{pos,products,inventory,split,reports,admin}/`
- `src/app/slip/[id]/`, `src/app/api/payments/{esewa,khalti,fonepay}/`, `src/app/api/transactions/`, `src/app/api/splits/`
- `src/components/{pos,split,slip,codes,ui}/`, `src/lib/{payments,supabase}/`, `src/hooks/`, `src/store/`, `src/types/`, `src/validators/`, `public/fonts/`

### 1.3 CI Pipeline
- `.github/workflows/ci.yml` — runs on push/PR to main: `checkout@v4` → `setup-node@v4` (node 20, cache npm) → `npm ci` → `npx tsc --noEmit` → `npm run lint` → `cp .env.local.example .env.local` → `npm run build`. No deploy step.

### 1.4 Supabase
- `supabase/schema.sql` — creates `products`, `transactions`, `split_sessions`, `split_participants` with indexes, RLS enabled on all four, basic RLS policies, and `update_updated_at` triggers.

### 1.5 AI-Collab Docs
- `docs/ai-collab/` — 8 files (README, HANDOVER, DECISIONS, FLOW, ARCHITECTURE, CONSTRAINTS, TEST_CHECKLIST, ROLLBACK)

### 1.6 Verification
- `npm install` — 497 packages
- `npx tsc --noEmit` — PASS (zero errors)
- `npx next lint` — PASS (1 warning, 0 errors)
- `npx next build` — PASS (11 routes)
- `npm run dev` — server starts, `http://localhost:3000` returns HTTP 200

### 1.7 Fixes Applied During Scaffolding
- Removed non-existent `@microsoft/zxing-wasm`, `shadcn-ui`, `@types/bwip-js` from `package.json`
- Fixed corrupted single-line `tsconfig.json` and `src/components/ui/index.ts`
- Added missing core files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/lib/query-provider.tsx`, `src/lib/utils.ts`, `src/lib/supabase/client.ts`, `src/lib/nepali-date.ts`
- Rewrote `QRScanner.tsx` to use zxing-wasm v3 functional `readBarcodes` API (v3 has no `ZXing` class)
- Rewrote `QRDisplay.tsx` to handle async `qrcode.toDataURL` via `useEffect` + state
- Added `src/types/external.d.ts` module declarations for `bwip-js` and `nepali-date`
- Fixed `useSupabase.ts` conditional hook call (lint error) by using module-level constants
- Fixed broken relative imports in `DashboardLayout.tsx` and `ShadcnComponents.tsx`
- Added `updateAssignedAmount` to the split store and wired SplitManager inputs correctly
- Installed missing `tailwindcss-animate@^1.0.7` (required by `tailwind.config.ts`, breaks `next dev` CSS compilation)
- Created `src/app/page.tsx` (was missing — `/` returned 404)

### 1.8 Git
- `git init` → `git add -A` (103 files, `.env.local` correctly excluded)
- Commit `e48483d` on `main`, pushed to `origin/main`

## Standard Development Rules

### TypeScript
- **Zero TypeScript errors** — `npx tsc --noEmit` must pass on every commit.
- `strict: true` — no implicit `any`, no loose null handling.
- No `any` type allowed (use `unknown` + type guards).

### Code Quality
- `npm run lint` (Next.js ESLint) must pass — no errors.
- Prettier formatting enforced (ESLint `prettier` extends).
- No `console.log` in production code.

### Security
- **Never** commit secrets or `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — never exposed to client or bundled.
- RLS (Row Level Security) must be enabled on **all** Supabase tables.
- All API routes must validate input with Zod before processing.

### Architecture
- All database queries go through Supabase client (no direct Prisma/raw SQL in routes).
- Payment gateway logic isolated in `src/lib/payments/` — no gateway-specific code in page components.
- State that persists across navigation → Zustand store.
- State that is server-derived → TanStack Query.
- All date displays use Nepali (BS) format in UI; ISO format in DB.

### Dependencies
- No new dependencies without team review and entry in `DECISIONS.md`.
- Prefer official/shadcn-compatible packages over forked alternatives.