import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Calendar,
  Check,
  Clock,
  AlertCircle,
  DollarSign,
  Coins,
} from "lucide-react";
import toast from "react-hot-toast";

import { formatCurrency, formatDate } from "../utils/formatters";
import { useTransactionStore } from "../stores/transactionStore";
import {
  TransferTransaction,
  DepositTransaction,
  TransactionDetailsModal,
} from "./TransactionDetails";
import { getTransationDetails } from "../services/transactions";
import { type TransactionType } from "../stores/transactionStore";

interface TransactionListProps {
  limit?: number;
  showSearch?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  // limit,
  showSearch = false,
}) => {
  const transactions = useTransactionStore((state) => state.getTransactions());
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<
    TransferTransaction | DepositTransaction | null
  >(null);
  const [transationType, setTransationType] = useState<TransactionType>(
    "" as TransactionType,
  );

  // const filteredTransactions = transactions
  //   .filter(transaction =>
  //     transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (transaction.recipient && transaction.recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
  //     (transaction.sender && transaction.sender.toLowerCase().includes(searchTerm.toLowerCase()))
  //   )
  //   .slice(0, limit || transactions.length);

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check size={16} className="text-secondary-500" />;
      case "pending":
        return <Clock size={16} className="text-amber-500" />;
      case "failed":
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  // const filteredTransactions: any[] = [];

  const getTransactionDetails = async (
    transactionId: string,
    type: TransactionType,
  ) => {
    setTransationType(type);

    try {
      setShowModal(true);
      const res = await getTransationDetails(transactionId, type);

      if (!res.ok) {
        setShowModal(false);
        return toast.error(res?.data?.error!);
      }

      if (res.ok) {
        setTransactionDetails(res?.data?.transaction!);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <TransactionDetailsModal
        isOpen={showModal}
        onClose={() => {
          setTransactionDetails(null);

          setShowModal(false);
        }}
        transaction={transactionDetails}
        type={transationType}
      />

      <div className="bg-white rounded-card shadow-card">
        {showSearch && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const isTransfer = transaction.type === "transfer";
                const isDeposit = transaction.type === "deposit";
                const isCredit = transaction.type === "credit";
                const isUSDTransaction = transaction.type === "usd_transaction";

                return (
                  <li
                    key={transaction.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    // onClick={() => {
                    //   setShowModal(true);
                    //   setTransationType(transaction.type);
                    //   setTransactionDetails(
                    //     transaction as TransferTransaction | DepositTransaction,
                    //   );
                    // }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            isDeposit || isCredit || isUSDTransaction
                              ? "bg-secondary-100 text-secondary-600"
                              : "bg-accent-100 text-accent-600"
                          }`}
                        >
                          {isTransfer && <ArrowUpRight size={20} />}

                          {isDeposit && <ArrowDownLeft size={20} />}

                          {isUSDTransaction && <DollarSign size={20} />}

                          {isCredit && <Coins size={20} />}
                        </div>

                        <div className="ml-4 truncate">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description || "Rulsar Transaction"}
                          </p>

                          <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <Calendar size={12} className="mr-1" />
                            <span>
                              {formatDate(
                                (transaction.createdAt &&
                                  transaction.createdAt) ||
                                  new Date(Date.now()).toDateString(),
                              )}
                            </span>
                            {/* {transaction.recipient && (
                          <span className="ml-2">
                            To: {transaction.recipient}
                          </span>
                        )}
                        {transaction.sender && (
                          <span className="ml-2">
                            From: {transaction.sender}
                          </span>
                        )} */}
                          </div>
                        </div>
                      </div>

                      <div className="ml-2 flex flex-col items-end">
                        <p
                          className={`text-sm font-medium ${
                            isDeposit || isUSDTransaction || isCredit
                              ? "text-secondary-600"
                              : "text-accent-600"
                          }`}
                        >
                          {isDeposit || isUSDTransaction || isCredit
                            ? "+"
                            : "-"}

                          {isCredit && `${transaction.amount} credits`}

                          {isUSDTransaction &&
                            `${formatCurrency(Number(transaction.amount), "USD")}`}

                          {isDeposit &&
                            `${formatCurrency(Number(transaction.amount))}`}
                        </p>

                        <div className="flex items-center mt-0.5">
                          {getStatusIcon("completed")}
                          <span className="text-xs text-gray-500 ml-1 capitalize">
                            completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-6 text-center text-gray-500">
                No transactions found
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default TransactionList;
