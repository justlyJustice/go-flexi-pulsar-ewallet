import apiClient from "./client";

import {
  DepositTransaction,
  TransferTransaction,
} from "../components/TransactionDetails";
import { TransactionType } from "../stores/transactionStore";

export const getUserTransactions = (userId: string) =>
  apiClient.get<{ data: [] }>(`/transactions/${userId}`);

export const getTransationDetails = (
  transactionId: string,
  type: TransactionType,
) =>
  apiClient.get<{
    transaction: DepositTransaction | TransferTransaction;
    error: string;
    success: false;
  }>(`/users/transactions/${transactionId}?type=${type}`);
