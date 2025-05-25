import client from "./client";

export const getTransferResponse = () => client.post("/webhooks/strowallet");

export const getUpdatedUserBalance = (id: string) =>
  client.get<{ user: any }>(`/users/${id}`);
