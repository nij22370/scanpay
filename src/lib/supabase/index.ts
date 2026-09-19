export { createClient } from "./client";
export { createClient as createServerClient, getAuthenticatedUser } from "./server";
export { supabaseAdmin } from "./admin";

import { createClient } from "./client";

export const supabase = createClient();