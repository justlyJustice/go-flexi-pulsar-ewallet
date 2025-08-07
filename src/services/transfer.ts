import { getUser } from "../stores/authStore";
import client from "./client";

type TransferParams = {
  amount: string;
  account_number: string;
  narration: string;
  name_enquiry_reference: string;
  bank_name: string;
};

const user = getUser();

export const transferFunds = ({
  account_number,
  amount,
  bank_name,
  name_enquiry_reference,
  narration,
}: TransferParams) =>
  client.post<{ message: string; success: boolean; data: any }>(
    `/transfer?amount=${amount}&account_number=${account_number}&narration=${narration}&name_enquiry_reference=${name_enquiry_reference}}&bank_name=${bank_name}&senderName=${user?.fullName}`
  );

export const verifyAccountName = (bankCode: string, accountNumber: string) =>
  client.get<{
    success: boolean;
    message: string;
    error: string;
    data: {
      data: {
        bank_code: string;
        account_number: string;
        account_name: string;
        sessionId: string;
      };
    };
  }>(
    `/transfer/check-account-name?bank_name=${bankCode}&account_number=${accountNumber}`
  );
