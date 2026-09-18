# ScanPay

> Nepal payment gateway integration platform — POS, split bills, multi-provider payments (eSewa, Khalti, FonePay), and transaction management.

![CI](https://github.com/nij22370/scanpay/actions/workflows/ci.yml/badge.svg)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript strict mode)
- **Styling**: Tailwind CSS + Shadcn UI
- **State**: Zustand (client) + TanStack Query v5 (server)
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL with RLS)
- **Payments**: eSewa, Khalti, FonePay

## Architecture

See [docs/ai-collab/ARCHITECTURE.md](docs/ai-collab/ARCHITECTURE.md) for system architecture details.

## AI Collaboration Docs

This project uses AI-collaboration documentation in [`docs/ai-collab/`](docs/ai-collab/) to maintain living documentation for builders and AI agents:

- [README](docs/ai-collab/README.md) — Overview and how to use this docs folder
- [Handover](docs/ai-collab/HANDOVER.md) — Context for switching between collaborators
- [Decisions](docs/ai-collab/DECISIONS.md) — Architecture and design decisions
- [Flows](docs/ai-collab/FLOW.md) — User flows and data flows
- [Architecture](docs/ai-collab/ARCHITECTURE.md) — System architecture, layers, and patterns
- [Constraints](docs/ai-collab/CONSTRAINTS.md) — Hard constraints, coding rules, and guardrails
- [Test Checklist](docs/ai-collab/TEST_CHECKLIST.md) — Test scenarios and verification checklist
- [Rollback](docs/ai-collab/ROLLBACK.md) — Rollback procedures and incident response

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production start |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check (no emit) |

## License

MIT
