import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  cashierId: string | null;
  cashierName: string | null;
  cashierEmail: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { id: string; name: string; email: string }) => void;
  clearAuth: () => void;
}

const initialAuthState = {
  cashierId: null,
  cashierName: null,
  cashierEmail: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialAuthState,
      setAuth: ({ id, name, email }) =>
        set({
          cashierId: id,
          cashierName: name,
          cashierEmail: email,
          isAuthenticated: true,
        }),
      clearAuth: () => set(initialAuthState),
    }),
    {
      name: "scanpay-auth",
    }
  )
);
