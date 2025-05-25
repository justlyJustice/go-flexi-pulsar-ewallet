import client from "./client";

export const getUpdatedUserBalance = (id: string) =>
  client.get<{ user: any }>(`/users/${id}`);
