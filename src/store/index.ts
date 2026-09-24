"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./cartStore";
import { useAuthStore } from "./authStore";

export { useCartStore, useAuthStore };

interface POSStore {
  selectedPaymentMethod: string | null;
  setPaymentMethod: (method: string) => void;
  isPaymentProcessing: boolean;
  setIsPaymentProcessing: (value: boolean) => void;
  lastTransactionId: string | null;
  setLastTransactionId: (id: string | null) => void;
}

export const usePOSStore = create<POSStore>((set) => ({
  selectedPaymentMethod: null,
  setPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
  isPaymentProcessing: false,
  setIsPaymentProcessing: (value) => set({ isPaymentProcessing: value }),
  lastTransactionId: null,
  setLastTransactionId: (id) => set({ lastTransactionId: id }),
}));

interface SplitStore {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  participants: Array<{ user_id: string; assigned_amount: number; paid_amount: number; is_paid: boolean; paid_at?: string | null }>;
  setParticipants: (participants: SplitStore["participants"]) => void;
  addParticipant: (participant: SplitStore["participants"][number]) => void;
  updateAssignedAmount: (user_id: string, amount: number) => void;
  updateParticipantPayment: (user_id: string, paid_amount: number, is_paid: boolean, paid_at?: string | null) => void;
  resetSplit: () => void;
}

export const useSplitStore = create<SplitStore>((set) => ({
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  participants: [],
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((state) => ({ participants: [...state.participants, participant] })),
  updateAssignedAmount: (user_id: string, amount: number) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.user_id === user_id ? { ...p, assigned_amount: amount } : p
      ),
    })),
  updateParticipantPayment: (user_id, paid_amount, is_paid, paid_at = null) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.user_id === user_id
          ? { ...p, paid_amount, is_paid, paid_at }
          : p
      ),
    })),
  resetSplit: () => set({ sessionId: null, participants: [] }),
}));