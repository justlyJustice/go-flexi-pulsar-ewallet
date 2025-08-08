import client from "./client";

import { Beneficiary } from "../stores/authStore";

type BeneficiaryData = {
  bank_code: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  beneficiary_type: string;
};

export const createBeneficiary = (beneficiary: BeneficiaryData) =>
  client.post<{
    error: string;
    beneficiaries: Beneficiary[];
    success: boolean;
  }>("/users/add-beneficiary", beneficiary);
