import client from "./client";

export const verifyKYC = () => client.post("/kyc");
