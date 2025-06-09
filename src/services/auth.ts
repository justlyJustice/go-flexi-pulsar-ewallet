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
  client.post<{
    success: boolean;
    error?: string;
    data: Record<string, string>;
  }>("/auth/signup", data);

export const requestPasswordRequest = (email: string) =>
  client.post("/auth/request-password-reset", { email });

export const resetPassword = ({
  email,
  newPassword,
}: {
  email: string;
  newPassword: string;
}) => client.post("/auth/reset-password", { email, newPassword });

export const verifyResetCode = (data: { email: string; emailOTP: string }) =>
  client.post("/auth/verify-otp", data);
