import client from "./client";

export const requestWithdrawal = (payload: {
  claimId: string;
  amount: string; // NGN
  accountDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}) =>
  client.post<{
    error: string;
    success: boolean;
    message: string;
    data: {
      withdrawalId: string;
      amount: number;
      authCode: string;
      expiresAt: string;
    };
  }>("/withdrawals", payload);

export const confirmWithdrawal = (withdrawalId: string, authCode: string) =>
  client.post<{
    error?: string;
    success: boolean;
    data: Record<string, unknown>;
  }>(`/withdrawals/${withdrawalId}/confirm`, { authCode });
