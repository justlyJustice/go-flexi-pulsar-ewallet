import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Beneficiary = {
  beneficiaryType: "individual" | "business" | "merchant";
  bankName: string;
  accountNumber: string;
  accountName: string;
  _id: string;
};

export interface User {
  id: string;
  email: string;
  currency: string;
  bankInformation: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  fullName: string;
  phoneNumber: string;
  joinDate: string;
  balance: number;
  transactions: [];
  cacVerified: boolean;
  merchantVerificationCode?: string;
  bvnVerified: boolean;
  ninVerified: boolean;
  isBlocked: boolean;
  isKYC: "pending" | "verified" | "unverified";
  vusd_card?: string;
  beneficiaries: Beneficiary[] | [];
  tier: "individual" | "merchant" | "business";
  dailyTransferAmount: number;
  dailyTransferLimit: number;
  monthlyTransferAmount: number;
  monthlyTransferLimit: number;
  lastDailyReset?: Date;
  lastMonthlyReset?: Date;
  lastTransferTime?: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateBalance: (amount: number) => void;
}

// For demo purposes, we'll use a fake authentication store
// In a real app, you would integrate with a backend API
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({ user, token, isAuthenticated: !!user && !!token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      updateBalance: (amount) =>
        set((state) => ({
          user: state.user ? { ...state.user, balance: amount } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);

// Export a direct way to access the token without hooks
export const getToken = () => useAuthStore.getState().token;

export const getUser = () => useAuthStore.getState().user;

export const getTransactions = () =>
  useAuthStore.getState().user?.transactions || [];
