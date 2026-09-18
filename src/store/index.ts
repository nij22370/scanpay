import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "scanpay-cart" }
  )
);

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
