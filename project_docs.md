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

---

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

---

## Day 2 — Auth + Responsive Layout Shell

### 2.1 Supabase Auth with SSR Support
- Installed `@supabase/ssr@0.5.2` for cookie-based server client
- `src/lib/supabase/client.ts` — `createBrowserClient` using `@supabase/ssr`
- `src/lib/supabase/server.ts` — `createServerClient` with Next.js cookie handling for App Router
- `src/lib/supabase/middleware.ts` — `updateSession` helper for route protection

### 2.2 Route Protection Middleware
- `middleware.ts` at project root — protects all `/pos`, `/products`, `/inventory`, `/split`, `/reports`, `/admin` routes
- Redirects unauthenticated users to `/login`
- Allows `/login` and `/slip/[id]` without authentication
- Redirects authenticated users away from `/login` to `/pos`

### 2.3 Login Page
- `src/app/(auth)/login/page.tsx` — email + password login form using React Hook Form + Zod
- Validates email format and password minimum 8 characters
- Stores cashier name from Supabase session in Zustand auth store
- Redirects to `/pos` on successful login

### 2.4 Auth State Management
- `src/store/authStore.ts` — Zustand store with `persist` middleware
- Stores `cashierId`, `cashierName`, `cashierEmail`, `isAuthenticated`
- `setAuth()` and `clearAuth()` actions

### 2.5 Responsive Layout Shell
- `src/app/(dashboard)/layout.tsx` — fully responsive layout with:
  - Mobile (< 1024px): top header with hamburger menu, store name, cashier avatar + bottom nav with 5 tabs
  - Desktop (≥ 1024px): fixed 240px left sidebar with nav items + logout at bottom
  - 5 nav items: POS, Products, Inventory, Split, Reports
  - Desktop-only Admin nav item
  - Framer Motion page transitions (opacity 0→1, 0.2s)
  - Lucide icons: ShoppingCart, Package, Archive, Users, BarChart2, Settings

### 2.6 Verification
- `npm run typecheck` — PASS
- `npm run lint` — PASS (1 pre-existing warning)
- `npm run build` — PASS (12 routes)

---

## Day 3 — Supabase Types + Global Providers

### 3.1 Global Providers
- `src/app/providers.tsx` — client component wrapping `QueryClientProvider`
- TanStack Query `QueryClient` with `staleTime: 5 minutes`, `retry: 1`
- Wrapped root layout with `<Providers>` instead of `<QueryProvider>`

### 3.2 Zod Validators (matching PRD database schema)
- `src/validators/product.schema.ts` — `ProductSchema`, `CreateProductSchema`, `UpdateProductSchema`
- `src/validators/transaction.schema.ts` — `TransactionSchema`, `CreateTransactionSchema`
- `src/validators/split.schema.ts` — `SplitSessionSchema`, `SplitParticipantSchema`, `CreateSplitSchema` (total: positive, people_count: 2-10, split_type: enum)
- `src/validators/index.ts` — re-exports all schemas + login schema, backward-compatible aliases (`productSchema`, `transactionSchema`, `splitSchema`, `ProductFormData`)

### 3.3 Shared Types
- `src/types/product.ts` — `Product` + `ProductWithLowStock` interface
- `src/types/transaction.ts` — `Transaction`, `TransactionWithItems`, `TransactionItem` interfaces
- `src/types/split.ts` — `SplitParticipant`, `SplitSession`, `SplitType`, `SplitSessionWithParticipants`
- `src/types/slip.ts` — `SlipData`, `SlipItem` interfaces
- `src/types/index.ts` — exports all types as named exports

### 3.4 Error Boundary
- `src/components/ErrorBoundary.tsx` — React class component
- Shows friendly "Something went wrong" message with "Try Again" button
- Accepts optional `fallback` prop

### 3.5 VAT Helpers
- `src/lib/vat.ts` — exports:
  - `VAT_RATE = 0.13`
  - `calculateVAT(amount: number): number`
  - `calculateTotal(subtotal: number, discount: number, vatApplicable: boolean): { vat: number, total: number }`
  - `formatCurrency(amount: number): string` — formats as NPR

### 3.6 Nepali Date Utilities
- `src/lib/nepali-date.ts` — exports:
  - `NepaliDate` class with `format()` method (backward compatible)
  - `convertToBS(date: Date): string` — returns "YYYY-MM-DD" BS date
  - `formatToBS(date: Date, pattern?: string): string`
  - `formatToBSLong(date: Date): string` — "YYYY MMMM DD" format

### 3.7 Verification
- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `npm run build` — PASS (12 routes)

---

## Day 4‑5 — QR & Barcode Generation
- Implemented QR code generation (`src/components/codes/QRGenerator.tsx`) using **qrcode** with PNG download.
- Implemented barcode generation (`src/components/codes/BarcodeGenerator.tsx`) using **bwip‑js** (EAN‑13, Code 128, DataMatrix) with PNG download.
- Added `/codes` page (`src/app/(dashboard)/codes/page.tsx`) with tabs for QR and barcode generation.
- Updated barrel export (`src/components/codes/index.ts`).
- Updated types (`src/types/product.ts`) with `CodeType` enum.
---

## Day 6 — Camera Barcode + QR Scanner

### 6.1 Scanner Components
- `src/components/pos/BarcodeScanner.tsx` — full-featured camera scanner using **zxing-wasm v3** `readBarcodes()` functional API
  - Camera lifecycle management via `useEffect` with proper stream cleanup on unmount
  - `getUserMedia` with `facingMode: "environment"` for rear camera on mobile
  - Continuous scan loop at 300ms intervals, reading frames via hidden `<canvas>`
  - Success beep via Web Audio API (`AudioContext` + `OscillatorNode` at 880 Hz)
  - Corner-bracket scanning overlay (240px viewfinder with white corner brackets)
  - "Scanning…" animated label with `center_focus_strong` icon
  - Camera permission denied → friendly error banner with manual fallback suggestion
  - Toggle between camera mode and manual text entry mode
  - Manual entry input with Enter key submit support
- `src/components/codes/QRScanner.tsx` — lightweight QR scanner component using `readBarcodes()` from `zxing-wasm/reader`

### 6.2 Self-Hosted WASM Binary
- Copied `node_modules/zxing-wasm/dist/reader/zxing_reader.wasm` (953 KB) to `public/wasm/zxing_reader.wasm`
- Both scanner components call `prepareZXingModule({ overrides: { locateFile: (path) => '/wasm/' + path } })` at module level
- WASM loads from app origin (`/wasm/zxing_reader.wasm`) — no CDN dependency
- Decision logged in `docs/ai-collab/DECISIONS.md`: PRD §13 offline-resilience target requires deterministic self-hosted binary on the checkout-critical scan path

### 6.3 Named Constants & Patterns
- `SCAN_INTERVAL_MS = 300`, `BEEP_FREQUENCY_HZ = 880`, `BEEP_DURATION_MS = 80`, `OVERLAY_SIZE_PX = 240`, `CORNER_BRACKET_SIZE_PX = 24`, `CORNER_BRACKET_THICKNESS_PX = 3`
- All event handlers extracted to named `useCallback` functions (`handleToggleManualEntry`, `handleManualInputChange`, `handleManualSubmit`, `handleManualKeyDown`)
- `playSuccessBeep()` extracted as standalone pure function outside the component

### 6.4 Verification
- `npx tsc --noEmit` — PASS (zero errors)
- WASM binary confirmed loading from `/wasm/zxing_reader.wasm` (self-hosted, not CDN)

---

## Days 7–8 — Product Catalog CRUD with Auto-Code Generation
- Added official Shadcn `Dialog` primitives (`src/components/ui/dialog.tsx`) powered by `@radix-ui/react-dialog`.
- Created pure barcode and QR serialization utilities in `src/utils/barcode.ts` for random 12-digit EAN-13 generation and compact JSON QR data.
- Updated `src/types/product.ts` and `src/validators/product.schema.ts` to strictly adhere to PRD §9 specifications (`id`, `name`, `name_np`, `price`, `category`, `stock`, `low_stock_threshold`, `vat_applicable`, `barcode`, `qr_data`, `image_url`, `created_at`).
- Built TanStack Query hooks in `src/hooks/products/useProducts.ts` with `useProducts`, `useCreateProduct` (auto EAN-13 & QR before insert), `useUpdateProduct` (optimistic updates), and `useDeleteProduct` (mutation with cache invalidation).
- Created `ProductModal.tsx` for adding and editing products with React Hook Form + Zod, and live visual preview for generated EAN-13, 80px QR codes, and image URL inputs.
- Created `DeleteProductDialog.tsx` for destructive action confirmation before calling Supabase delete.
- Implemented `/products` route page (`src/app/(dashboard)/products/page.tsx`) featuring real-time client-side name search, dynamic category filtering, responsive 1/2/3 grid layout with prominent hero images, stock badges, mini 80px QR codes, and CRUD action triggers.
- Created `ProductImageModal.tsx` for full high-res product image lightbox preview with category badges, price details, EAN-13 barcode, and direct edit action triggers upon clicking product hero images.
- Created seed utilities (`scripts/seed-bigmart-products.js` & `supabase/seed.sql`) for authentic Nepal supermarket catalogs (Big Mart / Bhat-Bhateni).
- Verified passing `npm run typecheck`, `npm run lint`, and `npm run build` across 15 routes.

---
 
## Days 9–10 — Inventory Manager
- Created `src/hooks/products/useInventory.ts` with `useInventory` (products sorted by stock ASC), `useUpdateStock` (optimistic single-product update), `useBulkUpdateStock` (array upsert), and `getStockStatus` helper.
- Built inventory UI components:
  - `InventoryAlertBanner` — top banner listing low/out-of-stock products with dismiss
  - `InventoryTable` — desktop table: name, category, editable stock input, threshold, status badge (OK/LOW/OUT), quick +/- buttons
  - `InventoryCard` — mobile card layout with same fields and quick adjust
  - `BulkUpdateModal` — modal listing all products with editable stock, sorted by priority (OUT → LOW → OK), save all at once
  - `CSVExportButton` — vanilla JS Blob download of name, name_np, barcode, price, stock, category
  - `CSVImport` — file input (CSV only), PapaParse preview table with validation errors, Supabase upsert on barcode conflict
- Updated `src/app/(dashboard)/inventory/page.tsx` with alert banner, responsive table/cards, bulk update, CSV import/export, skeletons, empty state (green checkmark when healthy), error with Retry button.
- Added `papaparse` + `@types/papaparse` dependency.
 
## Day 11 — Product Page Responsive QA
- Added `ProductCardSkeleton` (matches product card dimensions) and `InventoryTableSkeleton` (5 rows).
- Replaced inline skeletons in products page with `ProductCardSkeleton` (6 cards).
- Fixed text overflow on 414px: added `truncate` to product name, name_np, barcode.
- Inventory table already converts to card layout below `md` breakpoint (no horizontal scroll).
- Added `max-h-[90vh] overflow-y-auto` to all dialogs (`ProductModal`, `DeleteProductDialog`, `ProductImageModal`) to prevent viewport overflow on iPhone SE (375px).
- Products page error banner now includes Retry button calling `refetch()`.
- Verified `npm run typecheck`, `npm run lint`, `npm run build` all pass.
 
---
 
## Day 12 — POS Cart State & Product Search
- Created `src/store/cartStore.ts` — Zustand store with persist middleware (localStorage key: `scanpay-cart`). State: `items: CartItem[]` where `CartItem = { product: Product, quantity }`, `cashierNote: string`. Actions: `addItem(product)` (increments qty if exists), `removeItem(productId)`, `updateQuantity(productId, qty)` (removes if ≤0), `clearCart()`, `setCashierNote(note)`. Derived: `getSubtotal()`, `getItemCount()`.
- Created `src/hooks/useDebounce.ts` — generic `useDebounce<T>(value, delay)` hook.
- Created `src/hooks/useToast.tsx` — toast context/provider with `addToast(message, type)` and `useToast()` hook (success/error/info, auto-dismiss 3s).
- Created `src/components/pos/ProductSearch.tsx` — search input with Lucide Search icon, 300ms debounce, TanStack Query `useProductSearch` to Supabase (name ILIKE + barcode exact match), results dropdown (max 6): name, name_np, price, stock badge. Keyboard nav: ↑/↓ highlight, Enter select, Esc close. Click → calls `onProductSelect` → clears input.
- Added `useProductSearch(query)` hook to `src/hooks/products/useProducts.ts` — queries Supabase with `.or('name.ilike.%query%,barcode.eq.query')` limited to 6.
- Updated `src/components/pos/POSScreen.tsx` — responsive layout:
  - Mobile (<1024px): sticky search bar → ProductSearch dropdown → ProductGrid (quick add) → sticky cart → payment → actions. Cart count badge in header.
  - Desktop (≥1024px): Left 60% (search + ProductGrid), Right 40% sticky cart panel + payment + QR/barcode + actions.
  - Toast on add: "Added: [product name]" (success).
- Updated `src/components/pos/CartDisplay.tsx` for new `CartItem` shape (`item.product.id`, `item.product.name`, `item.product.price`).
- Wrapped POS page with `ToastProvider` in `src/app/(dashboard)/pos/page.tsx`.
- Verified `npm run typecheck`, `npm run lint`, `npm run build` all pass.
 
---

## Day 13 — Split Bill Manager, Printable Receipt Slip & Analytics Reports UI
- **Split Bill Route (`/split`)**: Created `src/app/(dashboard)/split/page.tsx` replacing placeholder `index.tsx`.
- **Split Bill Manager (`src/components/split/SplitManager.tsx`)**:
  - Cart total synchronization via `useCartStore` with manual bill amount override.
  - Quick Split preset buttons (2, 3, 4, 5 equal ways) with automatic per-person calculation & remainder handling.
  - Participant management: custom customer names, assigned amounts, payment method badges (Cash, eSewa, Khalti, FonePay), and payment status toggle.
  - Real-time progress bar of collected balance vs remaining balance.
  - Toast feedback and split session mutation handling.
- **Transaction Receipt Slip (`/slip/[id]`)**: Created `src/app/slip/[id]/page.tsx` replacing placeholder `index.tsx`.
- **Printable Slip UI (`src/components/slip/SlipDisplay.tsx`)**:
  - Clean thermal POS receipt aesthetic with store branding, VAT number, transaction details, and Nepali BS date formatting via `NepaliDate`.
  - Itemized table with quantities, prices, 13% VAT tax breakdown, and grand total in NPR.
  - Verification barcode (Code 128) & QR code.
  - One-click Browser Print (`window.print()`) with `@media print` rules for clean thermal paper output.
  - Client-side PDF receipt generation & instant download via `jsPDF`.
- **Financial Analytics Reports (`/reports`)**: Created `src/app/(dashboard)/reports/page.tsx` replacing placeholder `index.tsx`.
- **Reports Dashboard (`src/components/reports/ReportsPage.tsx`)**:
  - Date preset filtering (All, Today, Last 7 Days, This Month) and custom date range picker.
  - Summary metrics: Total Revenue (NPR), Total Transactions, Average Ticket Value.
  - Payment gateway revenue distribution progress bars (eSewa, Khalti, FonePay, Cash).
  - Recent transaction history table with direct receipt links.
  - CSV report export download via Blob.
- **Global Toast Provider (`src/app/providers.tsx`)**: Wrapped root `Providers` with `ToastProvider` for universal app-wide toast notifications.
- **Verification**: `npx tsc --noEmit` PASS (0 errors), `npm run lint` PASS (0 errors, 0 warnings), `npm run build` PASS (18 static/dynamic routes compiled).

---
 
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