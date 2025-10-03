import apiClient from "./client";

import {
  DepositTransaction,
  TransferTransaction,
} from "../components/TransactionDetails";

export const getUserTransactions = (id: string) =>
  apiClient.get<{ transactions: [] }>(`/users/${id}/transactions`);

export const getTransationDetails = (
  transactionId: string,
  type: "transfer" | "deposit"
) =>
  apiClient.get<{
    transaction: DepositTransaction | TransferTransaction;
    error: string;
    success: false;
  }>(`/users/transactions/${transactionId}?type=${type}`);
