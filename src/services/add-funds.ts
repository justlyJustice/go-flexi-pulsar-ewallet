import client from "./client";

export const getUpdatedUser = (id: string) =>
  client.get<{ user: any; error: string }>(`/users/${id}`);

export const fundUsdAccount = (amount: number) =>
  client.post<{
    error: string;
    success: boolean;
    message: string;
    reference: string;
  }>(`/users/send-usdt?amount=${amount}`);

export const getUsdStatus = (reference: string) =>
  client.get<{
    success: boolean;
    message: string;
    error: string;
    status: string;
  }>(`/users/user/usdt-status?reference=${reference}`);
