import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  // BarChart3,
  // TrendingUp,
  CreditCard,
  ArrowRightCircle,
  Wallet,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
// import { useTransactionStore } from "../stores/transactionStore";
import BalanceCard from "../components/BalanceCard";
import TransactionList from "../components/TransactionList";
import { formatCurrency } from "../utils/formatters";

// import { useBalancePolling } from "../hooks/useBalancePolling";
// import MonthlyIncome from "../components/MonthlyIncome";
import { WelcomeModal } from "../components/WelcomeModal";

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [showBalance, setShowBalance] = useState(false);
  // const getTransactions = useTransactionStore((state) => state.getTransactions);

  // const transactions = getTransactions();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  // Format balance with asterisks if hidden
  const displayBalance = showBalance
    ? formatCurrency(user?.balance || 0)
    : "******"; // Or use •••••• for dots

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <WelcomeModal />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.fullName}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="md:col-span-2">
          <BalanceCard
            displayBalance={displayBalance}
            showBalance={showBalance}
            toggleBalanceVisibility={toggleBalanceVisibility}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-1">
          <div className="bg-white rounded-card shadow-card h-full p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Link
                  to="/add-funds"
                  className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-20 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <Wallet className="h-3 w-2" />
                  </div>

                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      Add Funds
                    </p>
                    <p className="text-xs text-gray-500">
                      Add money to your wallet
                    </p>
                  </div>

                  <ArrowRightCircle className="ml-auto h-5 w-5 text-gray-400" />
                </Link>

                <Link
                  to="#"
                  className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-20 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-600">
                    <Send className="h-3 w-2" />
                  </div>

                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      Transfer Funds
                    </p>
                    <p className="text-xs text-gray-500">
                      Send money to others
                    </p>
                  </div>
                  <ArrowRightCircle className="ml-auto h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Available Balance
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {displayBalance}
                  </p>
                </div>

                <div className="p-2 bg-gray-100 rounded-full">
                  <CreditCard className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="md:col-span-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            <Link
              to="#"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all
              <ArrowRightCircle className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <TransactionList limit={5} />
        </div>

        {/* <div className="md:col-span-1">
          <div className="bg-white rounded-card shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Activity Summary
              </h3>

              <div className="p-2 bg-gray-100 rounded-full">
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-   mb-1">
                  <span className="text-sm text-gray-500">Monthly Income</span>

                  <span className="text-sm font-medium text-secondary-600">
                    {formatCurrency(
                      transactions
                        .filter(
                          (t) =>
                            (t.type === "deposit" ||
                              t.type === "transfer-in") &&
                            new Date(t.date).getMonth() ===
                              new Date().getMonth()
                        )
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-secondary-500 h-2 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              <MonthlyIncome transactions={transactions} />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">
                    Monthly Expenses
                  </span>

                  <span className="text-sm font-medium text-accent-600">
                    {formatCurrency(
                      transactions
                        .filter(
                          (t) =>
                            t.type === "transfer-out" &&
                            new Date(t.date).getMonth() ===
                              new Date().getMonth()
                        )
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent-500 h-2 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-full">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Last 7 days trend
                    </p>
                    <p className="text-xs text-gray-500">
                      Income has increased by 12%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
