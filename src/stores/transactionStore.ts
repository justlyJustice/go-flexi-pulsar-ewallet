import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TransactionType = 'deposit' | 'transfer-in' | 'transfer-out';

interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  recipient?: string;
  sender?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  getTransactions: () => Transaction[];
}

// For demo purposes, we'll use a local store
// In a real app, you would fetch from a backend API
export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [
        {
          id: '1',
          amount: 500,
          type: 'deposit',
          description: 'Initial deposit',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
        },
        {
          id: '2',
          amount: 50,
          type: 'transfer-out',
          description: 'Payment to John Doe',
          recipient: 'john@example.com',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
        },
        {
          id: '3',
          amount: 75,
          type: 'transfer-in',
          description: 'Payment from Jane Smith',
          sender: 'jane@example.com',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
        },
      ],
      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: Math.random().toString(36).substring(2, 11),
          date: new Date().toISOString(),
        };
        
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        
        return newTransaction;
      },
      getTransactions: () => {
        // Sort transactions by date (newest first)
        return [...get().transactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
    }),
    {
      name: 'transaction-storage',
    }
  )
);