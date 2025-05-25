import { useMemo } from "react";
import { formatCurrency } from "../utils/formatters";
import { Transactions } from "../stores/transactionStore";

const MonthlyIncome = ({ transactions }: { transactions: Transactions }) => {
  const currentMonthIncome = useMemo(() => {
    const now = new Date();
    return transactions
      .filter(
        (t) =>
          (t.type === "deposit" || t.type === "transfer-in") &&
          new Date(t.date).getMonth() === now.getMonth() &&
          new Date(t.date).getFullYear() === now.getFullYear()
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Calculate relative progress based on typical income
  const maxAmount = 500000; // Adjust this based on your typical user income
  const progressPercentage = Math.min(
    (currentMonthIncome / maxAmount) * 100,
    100
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-500">Monthly Income</span>
        <span className="text-sm font-medium text-secondary-600">
          {formatCurrency(currentMonthIncome)}
        </span>
      </div>

      {/* <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-secondary-500 h-2 rounded-full"
          style={{ width: "0%" }}
        ></div>
      </div> */}

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-secondary-500 h-2 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MonthlyIncome;
