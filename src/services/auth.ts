import client from "../services/client";

type Data = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: string;
};

export const loginUser = (data: { email: string; password: string }) =>
  client.post<{
    success: boolean;
    data: { [key: string]: any };
    user: { [key: string]: any };
  }>("/auth/login", data);

export const registerUser = (data: Data) =>
  client.post<{ success: boolean; data: Record<string, string> }>(
    "/auth/signup",
    data
  );
