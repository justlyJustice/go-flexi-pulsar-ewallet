import client from "./client";

type TransferParams = {
  amount: string;
  account_number: string;
  narration: string;
  name_enquiry_reference: string;
  bank_name: string;
};

export const transferFunds = ({
  account_number,
  amount,
  bank_name,
  name_enquiry_reference,
  narration,
}: TransferParams) =>
  client.post(
    `/transfer?amount=${amount}&account_number=${account_number}&narration=${narration}&name_enquiry_reference=${name_enquiry_reference}}&bank_name=${bank_name}`
  );
