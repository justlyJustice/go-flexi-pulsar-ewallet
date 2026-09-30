import { Claim } from "../types/claim";

import client from "./client";

export const getClaim = () =>
  client.get<{ error?: string; message?: string; data: Claim }>(
    "/claims/claim",
  );

export const createClaim = () =>
  client.post<{
    error?: string;
    message: string;
    data: Claim;
  }>("/claims");

export const viewClaimStatus = () => client.get("/claims/status");

export const submitClaim = (claimId: string, claimNumber: string) =>
  client.post<{ error: string; message: string; data: any; success: boolean }>(
    `/claims/${claimId}/submit`,
    { claimNumber },
  );
