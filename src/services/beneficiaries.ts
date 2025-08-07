import client from "./client";

type Beneficiary = {
  bank_code: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  beneficiary_type: string;
};

export const createBeneficiary = (beneficiary: Beneficiary) =>
  client.post<{ error: string; data: any; success: boolean }>(
    "/users/add-beneficiary",
    beneficiary
  );
