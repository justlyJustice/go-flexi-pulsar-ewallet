import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
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
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...userData } : null 
        })),
      updateBalance: (amount) =>
        set((state) => ({
          user: state.user 
            ? { ...state.user, balance: state.user.balance + amount } 
            : null
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);