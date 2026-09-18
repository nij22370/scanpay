# Constraints

## Hard Rules (Non-Negotiable)

### TypeScript
- **Zero TypeScript errors** — `npx tsc --noEmit` must pass on every commit.
- `strict: true` in tsconfig — no implicit `any`, no loose null handling.
- All API routes must have explicit request/response types.
- No `any` type allowed anywhere (use `unknown` + type guards).

### Code Quality
- `npm run lint` (Next.js ESLint) must pass — no errors.
- Prettier formatting enforced (ESLint `prettier` extends).
- No `console.log` in production code (allowed in dev/debug hooks only with `// TODO: remove`).

### Security
- **Never** commit secrets or `.env.local`. `.env.local.example` is committed, `.env.local` is gitignored.
- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — never exposed to client or bundled.
- RLS (Row Level Security) must be enabled on **all** Supabase tables.
- All API routes must validate input with Zod before processing.
- Payment webhook endpoints must verify signatures before trusting payloads.

### Architecture
- All database queries go through Supabase client (no direct Prisma/raw SQL in routes).
- Payment gateway logic isolated in `src/lib/payments/` — no gateway-specific code in page components.
- State that persists across navigation → Zustand store.
- State that is server-derived → TanStack Query.
- All date displays use Nepali (BS) format in UI; ISO format in DB.

### Testing
- Every commit must pass CI pipeline: typecheck → lint → build.
- TypeScript must compile without errors before any other check runs.
- Build verification requires `.env.local` from `.env.local.example` (fake values OK for CI).

### Dependencies
- No new dependencies without team review and entry in `DECISIONS.md`.
- Prefer official/shadcn-compatible packages over forked alternatives.

## Build Constraints
- Next.js build must complete successfully: `npm run build` passes.
- No unoptimized images in production (configure `images` in `next.config.js`).
- API routes must return proper status codes (2xx success, 4xx client error, 5xx server error).

## Git Constraints
- Commit messages follow conventional commits: `feat:`, `fix:`, `docs:`, `ci:`, `chore:`.
- `main` branch is always deployable — CI must pass before merge.
- Feature branches must be rebased on `main` before PR.
