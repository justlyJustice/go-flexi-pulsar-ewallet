import { Nuban, PaymentProvider } from "ng-bank-account-validator";
import axios from "axios";

// Initialize with Paystack

export const validateAccount = (accountNumber: string, bankCode: string) =>
  axios.get(
    `https://strowallet.com/api/banks/get-customer-name/?public_key=8GMRE6H8PSP8ODDDA8YYXOBVNGTW37&bank_code=${bankCode}&account_number=${accountNumber}`
  );
