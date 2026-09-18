"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { SplitSession, SplitParticipant } from "@/types";

export function useSplitSession(sessionId: string) {
  return useQuery<SplitSession | null>({
    queryKey: ["splitSession", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("split_sessions").select("*").eq("id", sessionId).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useSplitParticipantsBySession(sessionId: string) {
  return useQuery<SplitParticipant[]>({
    queryKey: ["splitParticipants", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("split_participants").select("*").eq("split_session_id", sessionId);
      if (error) throw error;
      return data;
    },
  });
}

export function useCompleteSplit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from("split_sessions")
        .update({ status: "completed" })
        .eq("id", sessionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["splitSessions"] });
      queryClient.invalidateQueries({ queryKey: ["splitSession", sessionId] });
    },
  });
}
