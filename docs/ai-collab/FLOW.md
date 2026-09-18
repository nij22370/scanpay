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