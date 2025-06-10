import React from "react";
import {
  Eye,
  EyeOff,
  Wallet,
  TrendingUp,
  // ArrowUpRight,
  // ArrowDownLeft,
  Copy,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
// import { useTransactionStore } from "../stores/transactionStore";

import toast from "react-hot-toast";

const BalanceCard: React.FC<{
  showBalance: boolean;
  displayBalance: string;
  toggleBalanceVisibility: () => void;
}> = ({ showBalance, displayBalance, toggleBalanceVisibility }) => {
  const { user } = useAuthStore();
  // const getTransactions = useTransactionStore((state) => state.getTransactions);

  // const transactions = getTransactions();

  // // Calculate income and expenses for the current month
  // const currentDate = new Date();
  // const firstDayOfMonth = new Date(
  //   currentDate.getFullYear(),
  //   currentDate.getMonth(),
  //   1
  // );

  // const monthlyTransactions = transactions.filter(
  //   (transaction) => new Date(transaction.date) >= firstDayOfMonth
  // );

  // const monthlyIncome = monthlyTransactions
  //   .filter((t) => t.type === "deposit" || t.type === "transfer-in")
  //   .reduce((sum, t) => sum + t.amount, 0);

  // const monthlyExpenses = monthlyTransactions
  //   .filter((t) => t.type === "transfer-out")
  //   .reduce((sum, t) => sum + t.amount, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-card shadow-card p-6 text-white h-fit">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Wallet className="h-8 w-8" />
          <h2 className="ml-2 text-xl font-semibold">Your Balance</h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Balance Toggle Button */}
          <button
            onClick={toggleBalanceVisibility}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition"
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? (
              <EyeOff className="h-2 w-2" />
            ) : (
              <Eye className="h-2 w-2" />
            )}
          </button>

          <div className="p-2 bg-white bg-opacity-20 rounded-full">
            <TrendingUp className="h-2 w-2" />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-white text-opacity-80">Available Balance</p>
        <p className="text-3xl font-bold mt-1">{displayBalance}</p>
      </div>

      <div className="mb-6 bg-white bg-opacity-10 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Account Details</h3>

        <div className="space-y-1">
          <div>
            <p className="text-xs text-white text-opacity-70">Bank Name</p>
            <p className="font-medium">
              {user?.bankInformation?.bankName || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-white text-opacity-70">Account Name</p>
            <p className="font-medium">
              {user?.bankInformation?.accountName || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-white text-opacity-70">Account Number</p>
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {user?.bankInformation?.accountNumber || "Not provided"}
              </p>
              {user?.bankInformation?.accountNumber && (
                <button
                  onClick={() =>
                    copyToClipboard(user.bankInformation.accountNumber)
                  }
                  className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition"
                  aria-label="Copy account number"
                >
                  <Copy className="h-2 w-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="grid grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-full">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium">Income</span>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {formatCurrency(monthlyIncome)}
          </p>
        </div>

        <div className="bg-white bg-opacity-10 rounded-lg p-3">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-full">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium">Expense</span>
          </div>
          <p className="mt-2 text-lg font-semibold">
            {formatCurrency(monthlyExpenses)}
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default BalanceCard;
