export { createClient } from "./client";

import { createClient } from "./client";

export const supabase = createClient();

// Server-only exports:
// - createServerClient, getAuthenticatedUser → import from "@/lib/supabase/server"
// - supabaseAdmin → import from "@/lib/supabase/admin"
// These must NOT be re-exported here to avoid pulling next/headers
// and server-only env vars into the client bundle.