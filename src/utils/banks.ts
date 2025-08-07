import axios from "axios";

// Initialize with Paystack

export const validateAccount = (accountNumber: string, bankCode: string) =>
  axios.get<{
    success: boolean;
    message: string;
    data: {
      bank_code: string;
      account_number: string;
      account_name: string;
      sessionId: string;
    };
  }>(
    `https://strowallet.com/api/banks/get-customer-name/?public_key=8GMRE6H8PSP8ODDDA8YYXOBVNGTW37&bank_code=${bankCode}&account_number=${accountNumber}`
  );
