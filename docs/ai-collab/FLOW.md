# Flows

> Document how execution actually travels — between files, functions, and modules. Bugs live in the gaps between files.

---

## 🗺️ Flow Index

```mermaid
graph TD
    A["🔐 Authentication"] --> B["💳 POS Transaction"]
    B --> C["💰 eSewa Payment"]
    B --> D["💰 Khalti Payment"]
    B --> E["💰 FonePay Payment"]
    B --> F["✂️ Split Bill"]
    F --> G["📊 Reports"]
    B --> H["📦 Product Mgmt"]
    H --> I["📋 Inventory"]

    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#22c55e,stroke:#16a34a,color:#fff
    style C fill:#f97316,stroke:#ea580c,color:#fff
    style D fill:#06b6d4,stroke:#0891b2,color:#fff
    style E fill:#a855f7,stroke:#7e22ce,color:#fff
    style F fill:#ec4899,stroke:#db2777,color:#fff
    style G fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Page
    participant A as API Route
    participant S as Supabase Auth

    U->>L: Enter credentials
    L->>A: POST /api/auth/login
    A->>S: Verify credentials
    S-->>A: Session token
    A-->>L: JWT access + refresh
    L-->>U: Redirect to Dashboard
```

```
[Login Page] → [Credentials] → [API Route: /api/auth/...] → [Supabase Auth] → [Session Token] → [Dashboard Layout]
```

---

## 2. POS — Create Transaction Flow

```mermaid
sequenceDiagram
    participant U as Cashier
    participant P as POS Page
    participant C as Cart (Zustand)
    participant M as Payment Method
    participant I as Initiate API
    participant V as Verify API
    participant T as Transaction DB
    participant S as Slip

    U->>P: Scan/select products
    P->>C: Add to cart (Zustand store)
    U->>M: Select payment method
    U->>I: POST /api/payments/{provider}/initiate
    I-->>U: Payment URL / redirect
    U->>V: POST /api/payments/{provider}/verify
    V->>T: Create transaction record
    T-->>V: Transaction ID
    V-->>S: Generate slip
    S-->>U: Show receipt
```

```
[POS Page] → [Add Products] → [Cart (Zustand Store)] → [Select Payment Method] → [Initiate Payment] → [Verify Payment] → [Create Transaction] → [Generate Slip]
```

---

## 3. eSewa Payment Flow

```mermaid
flowchart LR
    A["POS Page<br/>Select eSewa"] --> B["POST /api/payments/esewa/initiate"]
    B --> C["Get Payment URL"]
    C --> D["Redirect to eSewa"]
    D --> E["eSewa Callback"]
    E --> F["POST /api/payments/esewa/verify"]
    F --> G["Update Transaction Status"]

    style A fill:#f97316,stroke:#ea580c,color:#fff
    style B fill:#fb923c,stroke:#ea580c,color:#fff
    style F fill:#fdba74,stroke:#ea580c,color:#fff
```

---

## 4. Khalti Payment Flow

```mermaid
flowchart LR
    A["POS Page<br/>Select Khalti"] --> B["POST /api/payments/khalti/initiate"]
    B --> C["Get Payment URL"]
    C --> D["Redirect to Khalti"]
    D --> E["Khalti Callback"]
    E --> F["POST /api/payments/khalti/verify"]
    F --> G["Update Transaction Status"]

    style A fill:#06b6d4,stroke:#0891b2,color:#fff
    style B fill:#22d3ee,stroke:#0891b2,color:#fff
    style F fill:#67e8f9,stroke:#0891b2,color:#fff
```

---

## 5. FonePay Payment Flow

```mermaid
flowchart LR
    A["POS Page<br/>Select FonePay"] --> B["POST /api/payments/fonepay"]
    B --> C["Process Payment"]
    C --> D["Update Transaction Status"]

    style A fill:#a855f7,stroke:#7e22ce,color:#fff
    style B fill:#c084fc,stroke:#7e22ce,color:#fff
```

---

## 6. Split Bill Flow

```mermaid
sequenceDiagram
    participant U as Cashier
    participant S as Split Manager
    participant P as Participants
    participant V as Verify All
    participant C as Complete

    U->>S: Create Split Session
    U->>P: Add participants
    loop Each participant
        P->>V: Pay assigned amount
    end
    V->>C: Verify all payments
    C-->>U: Complete split
```

---

## 7. Report Generation Flow

```mermaid
flowchart LR
    A["Reports Page"] --> B["Select Date Range"]
    B --> C["Query Transactions"]
    C --> D["Aggregate Data"]
    D --> E["Display Charts/Tables"]
    E --> F["Export PDF (jsPDF)"]
```

---

## 8. Product Management Flow

```mermaid
flowchart LR
    A["Products Page"] --> B["Add/Edit Product"]
    B --> C["Zod Validation"]
    C --> D["API Route"]
    D --> E["Supabase DB"]
    E --> F["Update Inventory"]
    F --> G["Refresh Product List"]
```

---

## 9. Inventory Flow

```mermaid
flowchart LR
    A["Inventory Page"] --> B["View Stock Levels"]
    B --> C["Low Stock Alerts"]
    C --> D["Add/Remove Stock"]
    D --> E["Update DB"]
    E --> F["Sync with Products"]
```

---

> 💡 **Why this matters**: Bugs live in the gaps between files. If you can't see the flow, you can't see where it breaks — and neither can the AI.

---

## 10. Cart UI + Scanner Integration Flow (Days 14–15)

```mermaid
sequenceDiagram
    participant U as Cashier
    participant P as POS Page
    participant C as Cart (Zustand)
    participant S as Scanner Modal
    participant B as BarcodeScanner
    participant DB as Supabase

    U->>P: Tap Camera icon
    P->>S: Open DynamicBarcodeScanner
    S->>B: Start camera / manual entry
    U->>B: Scan barcode
    B->>S: Return barcode string
    S->>DB: select * from products where barcode = ?
    DB-->>S: Product data
    S->>C: addItem(product)
    C-->>P: Cart updated (persisted)
    P-->>U: Toast "Added: [name]"
    U->>P: Tap F2 / Pay button
    P->>P: Validate: cart not empty, stock > 0
    P->>P: Open Payment Modal
```

```
[POS Page] → [Camera Button] → [Scanner Modal] → [BarcodeScanner] → [Supabase Lookup] → [Cart Store] → [Toast] → [F2/Pay] → [Validation] → [Payment Modal]
```

---

## 11. Bill Preview + Payment Modal Flow (Days 16–17)

```mermaid
sequenceDiagram
    participant U as Cashier
    participant P as POS Page
    participant PM as PaymentModal
    participant BP as BillPreview
    participant C as Cart (Zustand)
    participant A as Auth Store

    U->>P: Tap F2 or Pay button
    P->>P: Pre-validation: cart items > 0, all stock > 0
    P->>PM: Open PaymentModal (Dialog)
    PM->>C: Read items, subtotal
    PM->>A: Read cashierName
    PM->>PM: Calculate totals (discount, VAT, total)
    U->>PM: Adjust discount / Select tab (Cash/QR/Split)
    U->>PM: Tap "Preview Bill"
    PM->>BP: Open BillPreview overlay
    BP->>C: Read items
    BP->>A: Read cashierName
    BP->>BP: Format A.D. + B.S. date
    BP->>BP: Render items table + totals
    BP-->>U: Show bill preview
    U->>BP: Tap Print / Close
    U->>PM: Complete payment (Phase 5-7)
```

```
[POS Page] → [F2/Pay] → [Pre-validation] → [PaymentModal] → [Cart + Auth Store] → [Totals Calc] → [Tab Selection] → [Preview Bill] → [BillPreview] → [Cart + Auth] → [Date Formatting] → [Render Bill] → [Print/Close] → [Payment Completion]
```

---

## 12. Cart Totals Calculation Flow (Shared)

```mermaid
flowchart TD
    A["Cart Items"] --> B["useCartTotals(discount)"]
    B --> C["Subtotal = sum(price * qty)"]
    B --> D["vatApplicable = any(item.vat_applicable)"]
    C --> E["Discount = input value (min 0)"]
    D --> F{"vatApplicable?"}
    F -->|Yes| G["VAT = round((subtotal - discount) * 0.13)"]
    F -->|No| H["VAT = 0"]
    G --> I["Total = subtotal - discount + VAT"]
    H --> I
    I --> J["formatCurrency for all 4 rows"]
    J --> K["Return {subtotal, discount, vat, total, formatted}"]
    K --> L["CartSheet"]
    K --> M["CartPanel"]
    K --> N["BillPreview"]
    K --> O["PaymentModal"]
```

```
[Cart Items] → [useCartTotals] → [Subtotal + VAT Applicable] → [Discount] → [VAT Calc] → [Total] → [Format] → [Return] → [CartSheet, CartPanel, BillPreview, PaymentModal]
```