export type TransactionType =
  | "transfer"
  | "deposit"
  | "credit"
  | "usd_transaction"
  | "debit";

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
