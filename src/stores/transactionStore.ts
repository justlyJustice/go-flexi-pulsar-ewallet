import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getTransactions as getUserTransactions } from "./authStore";

export type TransactionType =
  | "transfer"
  | "deposit"
  | "credit"
  | "usd_transaction"
  | "debit";
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

export type Transaction = {
  id: string;
  currency?: "USD" | "NGN";
  description?: string;
  createdAt: string;
  type: TransactionType;
  amount: string;
  netAmount?: string;
};

export type Transactions = Transaction[];

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "_id" | "createdAt">) => void;
  getTransactions: () => Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
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
