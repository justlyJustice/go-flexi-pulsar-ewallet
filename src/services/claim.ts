import client from "./client";

export const createClaim = () => client.post("/claims");

export const viewClaimStatus = () => client.get("/claims/status");

export const submitClaim = (claimId: string, claimDetails: any) =>
  client.post(`/claims/${claimId}/submit`, claimDetails);
