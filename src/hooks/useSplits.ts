import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { SplitSession, SplitParticipant } from "@/types";

export function useSplitSessions() {
  return useQuery<SplitSession[]>({
    queryKey: ["splitSessions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("split_sessions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSplitParticipants(splitSessionId: string) {
  return useQuery<SplitParticipant[]>({
    queryKey: ["splitParticipants", splitSessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("split_participants").select("*").eq("split_session_id", splitSessionId);
      if (error) throw error;
      return data;
    },
    enabled: !!splitSessionId,
  });
}

export function useCreateSplitSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: Omit<SplitSession, "id" | "created_at" | "updated_at" | "paid_amount">) => {
      const { data, error } = await supabase.from("split_sessions").insert(session).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["splitSessions"] }),
  });
}