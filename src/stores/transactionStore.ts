import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getTransactions as getUserTransactions } from "./authStore";

import { Transaction, Transactions } from "../types/transaction";

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

interface TransactionState {
  transactions: Transactions;
  addTransaction: (transaction: Omit<Transaction, "_id" | "createdAt">) => void;
  getTransactions: () => Transaction[];
  setTransactions: (transactions: Transactions) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, _get) => ({
      setTransactions: (transactions) => {
        set(() => ({
          transactions: transactions,
        }));
      },
      transactions: getUserTransactions() || [],
      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          _id: Math.random().toString(36).substring(2, 11),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        return transaction;
      },
      getTransactions: () => {
        return _get().transactions;
      },
    }),
    {
      name: "transaction-storage",
    },
  ),
);
