import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTransactions } from "./authStore";

type TransactionType = "transfer" | "deposit";
// "deposit" | "transfer-in" | "transfer-out";

// interface Transaction {
//   id: string;
//   amount: number;
//   type: TransactionType;
//   description: string;
//   date: string;
//   recipient?: string;
//   sender?: string;
//   status: "completed" | "pending" | "failed";
// }

type Transaction = {
  id: string;
  description?: string;
  createdAt: string;
  type: TransactionType;
  amount: string;
  netAmount?: string;
};

export type Transactions = Transaction[];

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  getTransactions: () => Transaction[];
}

// For demo purposes, we'll use a local store
// In a real app, you would fetch from a backend API
export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: getTransactions(),
      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        return transaction;
      },
      getTransactions: () => {
        // Sort transactions by date (newest first)
        return [...get().transactions];
      },
    }),
    {
      name: "transaction-storage",
    }
  )
);
