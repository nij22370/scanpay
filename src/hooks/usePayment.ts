"use client";

import { usePOSStore } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateError } from "@/hooks/useError";

export function usePaymentMutation(provider: "esewa" | "khalti" | "fonepay") {
  const queryClient = useQueryClient();
  const setIsPaymentProcessing = usePOSStore((s) => s.setIsPaymentProcessing);

  return useMutation({
    mutationFn: async (payload: { amount: number; transactionId: string }) => {
      setIsPaymentProcessing(true);
      try {
        const response = await fetch(`/api/payments/${provider}/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Payment initiation failed");
        return data;
      } finally {
        setIsPaymentProcessing(false);
      }
    },
    onSuccess: (data) => {
      if (data?.transactionId) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }
    },
    onError: (error) => {
      // Surface the error string to the UI via the error boundary / toast.
      generateError(error);
    },
  });
}