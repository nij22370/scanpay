// Re-export the UI primitives from the single barrel file at
// `src/components/ui/index.tsx`. This module exists so legacy imports such
// as `@/components/ui/Button` keep resolving. New code should import from
// `@/components/ui` directly.
export * from "./index";