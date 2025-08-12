import client from "./client";

export const getUpdatedUser = (id: string) =>
  client.get<{ user: any; error: string }>(`/users/${id}`);
