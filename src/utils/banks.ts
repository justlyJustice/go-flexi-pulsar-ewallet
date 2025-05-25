import { Nuban, PaymentProvider } from "ng-bank-account-validator";

// Initialize with Paystack
const nuban = new Nuban(
  "sk_test_adc25ca6ce1ed7d928ed72f642d51432baf3b442",
  PaymentProvider.PAYSTACK
);

export const validateAccount = (accountNumber: string, bankCode: string) =>
  nuban.validateAccount(accountNumber, bankCode);
