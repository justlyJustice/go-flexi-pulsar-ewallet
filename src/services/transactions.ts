import apiClient from "./client";

export const getUserTransactions = (id: string) =>
  apiClient.get<{ transactions: [] }>(`/users/${id}/transactions`);
