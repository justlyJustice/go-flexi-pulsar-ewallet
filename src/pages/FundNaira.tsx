import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Banknote,
  AlertTriangle,
  Wallet,
  Coins,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { formatCurrency } from "../utils/formatters";
import { getUpdatedUser } from "../services/add-funds";
import toast from "react-hot-toast";

const FundNaira: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuthStore();

  const [nairaAmount, setNairaAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [countdownTime, setCountdownTime] = useState(300);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "completed" | "failed"
  >("pending");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showExtendedWait, setShowExtendedWait] = useState(false);

  const calcNetAmount = (amount: number) => {
    const PERCENTAGE_FEE = 0.025;
    const FIXED_FEE = 100;

    const percentageFee = amount * PERCENTAGE_FEE;
    let totalFee = percentageFee + FIXED_FEE;
    totalFee = Math.min(2500, totalFee);

    let netAmount = amount - totalFee;
    netAmount = Math.max(0, netAmount);

    return {
      netAmount: Math.max(0, netAmount),
      totalFee: totalFee,
    };
  };

  const { netAmount, totalFee } = useMemo(() => {
    const amountValue = parseFloat(nairaAmount) || 0;
    return calcNetAmount(amountValue);
  }, [nairaAmount]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (countdownTime === 0 && isLoading && !showExtendedWait) {
      handleTimeout();
    }
  }, [countdownTime, isLoading]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setShowExtendedWait(true);
    setError("Still verifying your payment. Please wait a moment longer...");

    const verifyExtended = async () => {
      try {
        const amountValue = parseFloat(nairaAmount);
        let verified = false;
        const startTime = Date.now();
        const extendedTimeout = 40000;

        while (Date.now() - startTime < extendedTimeout && !verified) {
          const verificationResult = await checkBalanceUpdate(user?.id!);

          if (verificationResult.success) {
            verified = true;
            updateBalance(verificationResult.newBalance);
            setTransactionStatus("completed");
            setStep(3);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        setShowExtendedWait(false);
        setTransactionStatus("failed");
        setError(
          "We couldn't verify your payment. Please check your bank account. " +
            "If the payment was made, it may still process shortly."
        );
      } catch (error) {
        setShowExtendedWait(false);
        setTransactionStatus("failed");
        setError("An error occurred while verifying your payment.");
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    };

    verifyExtended();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setNairaAmount(value);
    }
  };

  const handleContinue = () => {
    if (!nairaAmount || parseFloat(nairaAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    setStep(2);
  };

  const checkBalanceUpdate = async (userId: string) => {
    try {
      const res = await getUpdatedUser(userId);

      if (!res.ok) {
        throw new Error("Failed to fetch updated balance");
      }

      const currentFrontendBalance = user?.balance || 0;
      const newBackendBalance = res.data?.user.accountBalance;

      if (newBackendBalance > currentFrontendBalance) {
        return { success: true, newBalance: newBackendBalance };
      }

      return { success: false, newBalance: newBackendBalance };
    } catch (error) {
      console.error("Error checking balance:", error);
      throw error;
    }
  };

  const startBalanceVerification = async () => {
    if (!user?.id) return;

    const amountValue = parseFloat(nairaAmount);
    if (isNaN(amountValue) || amountValue <= 0) return;

    setIsLoading(true);
    setError("");
    setTransactionStatus("pending");
    setCountdownTime(300);

    try {
      const timer = setInterval(() => {
        setCountdownTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      let verificationResult = await checkBalanceUpdate(user.id);

      while (!verificationResult.success && countdownTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, 20000));
        verificationResult = await checkBalanceUpdate(user.id);
      }

      clearInterval(timer);

      if (verificationResult.success) {
        updateBalance(verificationResult.newBalance);
        setTransactionStatus("completed");
        setStep(3);
      } else {
        setTransactionStatus("failed");
        setError("Transfer not verified. Please check your bank account.");
      }
    } catch (error) {
      setTransactionStatus("failed");
      setError("Transaction verification failed. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await startBalanceVerification();
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-2xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Funds</h1>

        <p className="text-gray-600 mb-4">Add money to your Rulsar account</p>
      </motion.div>

      <div className="bg-white rounded-card shadow-card p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Enter Amount
                </h2>
                <div className="bg-gray-100 rounded-full p-2">
                  <Coins className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                How much would you like to add?
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₦</span>
                </div>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  className="input pl-8"
                  placeholder="0.00"
                  value={nairaAmount}
                  onChange={handleAmountChange}
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(user?.balance || 0)}
                </p>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                  Transaction Details
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Amount to deposit:</div>
                  <div className="text-right font-medium">
                    {formatCurrency(parseFloat(nairaAmount) || 0)}
                  </div>
                  <div className="text-gray-600">Percentage fee (2.5%):</div>
                  <div className="text-right font-medium">
                    -{formatCurrency(totalFee || 0)}
                  </div>
                  <div className="text-gray-600">Fixed fee:</div>
                  <div className="text-right font-medium">
                    -{formatCurrency(100) || 0}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    Net deposit:
                  </div>
                  <div className="text-right font-semibold text-blue-600">
                    {formatCurrency(netAmount || 0)}
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  This is the amount that will be credited to your wallet.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={netAmount === 0}
                type="button"
                onClick={handleContinue}
                className={`btn btn-primary px-6 ${
                  netAmount === 0 ? "disabled bg-primary-500" : ""
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Bank Transfer Details
                </h2>
                <div className="bg-gray-100 rounded-full p-2">
                  <Banknote className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500">See details below.</p>
                <div className="text-right">
                  <span className="text-sm font-medium text-primary-600">
                    Amount: {formatCurrency(parseFloat(nairaAmount) || 0)}
                  </span>
                  <span className="block text-xs text-gray-500">
                    Net deposit: {formatCurrency(netAmount)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
                  <h3 className="font-medium text-primary-800 mb-2">
                    Bank Transfer Instructions
                  </h3>
                  <ul className="text-sm text-primary-700 space-y-1">
                    <li className="flex items-center">
                      <span className="h-5 w-5 rounded-full bg-primary-200 text-primary-800 inline-flex items-center justify-center mr-2 flex-shrink-0 text-xs">
                        1
                      </span>
                      <span>Log in to your bank account</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-5 w-5 rounded-full bg-primary-200 text-primary-800 inline-flex items-center justify-center mr-2 flex-shrink-0 text-xs">
                        2
                      </span>
                      <span>Make a transfer to the following account</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-5 w-5 rounded-full bg-primary-200 text-primary-800 inline-flex items-center justify-center mr-2 flex-shrink-0 text-xs">
                        3
                      </span>
                      <span>
                        Click on confirm transfer if you've made the transfer
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg items-center">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Bank Name:</span>
                    <span className="text-sm font-medium">
                      {user?.bankInformation.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Account Name:</span>
                    <span className="text-sm font-medium">
                      {user?.bankInformation.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Account Number:
                    </span>
                    <span className="text-sm font-medium">
                      {user?.bankInformation.accountNumber}
                    </span>
                  </div>
                </div>

                {isLoading && (
                  <div className="my-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-blue-700">
                        {transactionStatus === "pending"
                          ? "Waiting for transfer confirmation..."
                          : "Transfer verification completed"}
                      </p>
                      <div className="text-sm font-medium text-blue-800">
                        Time remaining: {formatTime(countdownTime)}
                      </div>
                    </div>
                    {countdownTime < 30 && transactionStatus === "pending" && (
                      <p className="text-xs text-blue-600 mt-1">
                        Please complete your bank transfer soon
                      </p>
                    )}
                  </div>
                )}

                {transactionStatus === "failed" && error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Transaction Verification
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                        <div className="mt-2 text-xs text-red-600">
                          <p>
                            Don't worry - if you made the transfer, it will be
                            processed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {showExtendedWait && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {error}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary px-6"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-3 w-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Confirming...
                    </div>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-secondary-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-secondary-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Funds Added Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              {formatCurrency(netAmount)} has been credited to your wallet
              <span className="block text-sm text-gray-500 mt-1">
                (from {formatCurrency(parseFloat(nairaAmount))} after fees)
              </span>
            </p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4 inline-block">
              <div className="flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-600 mr-2" />
                <span className="font-medium text-gray-900">
                  New Balance: {formatCurrency(user?.balance || 0)}
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="btn btn-primary px-6"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FundNaira;
