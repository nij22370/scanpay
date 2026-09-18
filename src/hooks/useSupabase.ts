"use client";

import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/hooks/useEnv";

let client: ReturnType<typeof createClient> | null = null;

export function useSupabaseClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}