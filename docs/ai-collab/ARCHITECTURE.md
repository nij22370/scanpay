# Architecture

> A high-level map of the system: modules, services, how data moves between them. Not implementation detail — the shape of the thing.

---

## 🗺️ System Overview

```mermaid
graph TB
    subgraph Client["🌐 Browser (Client)"]
        direction LR
        A["🔐 Auth Page"]
        B["💳 POS Pages"]
        C["📊 Reports / Admin"]
        D["layout.tsx<br/>QueryClientProvider"]
    end

    subgraph API["⚙️ API Routes (Server)"]
        E["/api/payments/esewa"]
        F["/api/payments/khalti"]
        G["/api/payments/fonepay"]
        H["/api/transactions"]
        I["/api/splits"]
    end

    subgraph DB["🗄️ Supabase (PostgreSQL)"]
        J["products"]
        K["transactions"]
        L["split_sessions"]
        M["split_participants"]
    end

    subgraph GW["🏢 Payment Gateways"]
        N["eSewa"]
        O["Khalti"]
        P["FonePay"]
    end

    Client --> API
    API --> DB
    API --> GW
    GW --> API

    style Client fill:#3b82f6,stroke:#2563eb,color:#fff
    style API fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style DB fill:#22c55e,stroke:#16a34a,color:#fff
    style GW fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 📂 Folder Architecture

```mermaid
graph TD
    SRC["src/"]
    APP["app/"]
    AUTH["(auth)/<br/>login/"]
    DASH["(dashboard)/<br/>pos, products, inventory,<br/>split, reports, admin"]
    SLIP["slip/[id]/"]
    APIR["api/<br/>payments/{esewa,khalti,fonepay},<br/>transactions, splits"]
    COMP["components/<br/>pos, split, slip, codes, ui"]
    LIB["lib/<br/>payments, supabase"]
    HOOKS["hooks/"]
    STORE["store/"]
    TYPES["types/"]
    VAL["validators/"]

    SRC --> APP
    SRC --> COMP
    SRC --> LIB
    SRC --> HOOKS
    SRC --> STORE
    SRC --> TYPES
    SRC --> VAL
    APP --> AUTH
    APP --> DASH
    APP --> SLIP
    APP --> APIR

    style APP fill:#3b82f6,stroke:#2563eb,color:#fff
    style APIR fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style COMP fill:#f59e0b,stroke:#d97706,color:#fff
    style LIB fill:#22c55e,stroke:#16a34a,color:#fff
```

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/            # Route group: authentication pages
│   │   └── login/
│   ├── (dashboard)/       # Route group: authenticated pages
│   │   ├── pos/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── split/
│   │   ├── reports/
│   │   └── admin/
│   ├── slip/[id]/         # Dynamic route: transaction slip PDF
│   └── api/               # API routes (serverless functions)
│       ├── payments/
│       │   ├── esewa/
│       │   ├── khalti/
│       │   └── fonepay/
│       ├── transactions/
│       └── splits/
├── components/
│   ├── pos/               # POS-specific UI components
│   ├── split/             # Split-bill components
│   ├── slip/              # Slip/receipt components
│   ├── codes/             # QR/barcode components
│   └── ui/                # Shadcn UI base components
├── lib/
│   ├── payments/          # Payment gateway helpers & types
│   └── supabase/          # Supabase client & helpers
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── validators/            # Zod validation schemas
```

---

## 🔄 Data Flow Pattern

```mermaid
sequenceDiagram
    participant SC as Server Component (page.tsx)
    participant CC as Client Component (use client)
    participant TQ as TanStack Query
    participant Z as Zustand
    participant RHF as React Hook Form + Zod
    participant API as API Route / Server Action

    SC->>SC: Fetch data via Supabase client
    SC-->>CC: Pass data as props
    CC->>TQ: useQuery / useMutation
    CC->>Z: Ephemeral state (cart, form state)
    CC->>RHF: Form validation
    CC->>API: POST /api/...
    API-->>CC: Mutation result
```

```
Server Component (page.tsx)
  ├── Fetch data directly (server-side) via Supabase client
  ├── Pass data to Client Components as props
  └── Client Component (use client)
       ├── TanStack Query for caching/refetching
       ├── Zustand for ephemeral state (cart, form state)
       ├── React Hook Form + Zod for form handling
       └── Server Actions or API routes for mutations
```

---

## 🏗️ Key Patterns

| # | Pattern | Description |
|---|---------|-------------|
| 1 | **Server Components** | Data fetching and SEO handled server-side by default |
| 2 | **Client Components** | Interactivity via `"use client"` directive |
| 3 | **Route Groups** | `(auth)` and `(dashboard)` share layouts without affecting URL |
| 4 | **API Routes** | Under `app/api/` for payment gateway webhooks and server actions |
| 5 | **Dynamic Routes** | `slip/[id]` for unique transaction receipt URLs |
| 6 | **Shared Zod Schemas** | Used by both RHF forms and API validation |
| 7 | **RLS on All Tables** | Server uses service role, client uses anon key |

---

> 💡 **Why this matters**: Without a map, every session starts by guessing the terrain. With one, the AI can reason about impact before it writes a single line.