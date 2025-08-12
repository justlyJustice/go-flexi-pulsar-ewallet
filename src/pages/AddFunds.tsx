import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  // CreditCard as CardIcon,
  Coins,
  Banknote,
  AlertTriangle,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { formatCurrency } from "../utils/formatters";
import { getUpdatedUser } from "../services/add-funds";

type TabType = "add-naira" | "convert-to-usdt";

const AddFunds: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuthStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("add-naira");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [countdownTime, setCountdownTime] = useState(300);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "completed" | "failed"
  >("pending");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showExtendedWait, setShowExtendedWait] = useState(false);
  const extendedWaitRef = useRef<NodeJS.Timeout | null>(null);

  const [usdtAmount, setUsdtAmount] = useState(0); // New USD amount state
  const [exchangeRate, setExchangeRate] = useState(0); // New exchange rate state

  // Add this new useEffect for exchange rate calculation
  // useEffect(() => {
  //   const fetchExchangeRate = async () => {
  //     try {
  //       const rate = await convertNairaToUSDT(1);
  //       setExchangeRate(rate);
  //       const amountValue = parseFloat(amount) || 0;
  //       setUsdtAmount(amountValue * rate);
  //     } catch (err) {
  //       console.error("Failed to get exchange rate:", err);
  //     }
  //   };

  //   if (activeTab === "convert-to-usdt" && amount) {
  //     fetchExchangeRate();
  //   }
  // }, [amount, activeTab]);

  const calcNetAmount = (amount: number) => {
    const PERCENTAGE_FEE = 0.025; // 2.5%
    const FIXED_FEE = 100; // ₦100 fixed fee

    const percentageFee = amount * PERCENTAGE_FEE;
    const totalFee = percentageFee + FIXED_FEE;
    const netAmount = amount - totalFee;

    return {
      netAmount: Math.max(0, netAmount), // Ensure no negative values
      // totalFee: totalFee,
    };
  };

  const { netAmount } = useMemo(() => {
    const amountValue = parseFloat(amount) || 0;
    return calcNetAmount(amountValue);
  }, [amount]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  // Add this useEffect to handle countdown timeout
  useEffect(() => {
    if (countdownTime === 0 && isLoading && !showExtendedWait) {
      // Time is up and still loading
      handleTimeout();
    }
  }, [countdownTime, isLoading]);

  const handleTimeout = () => {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    // First show the "waiting" message
    setShowExtendedWait(true);
    setError("Still verifying your payment. Please wait a moment longer...");

    // Start extended verification
    const verifyExtended = async () => {
      try {
        const amountValue = parseFloat(amount);
        let verified = false;
        const startTime = Date.now();
        const extendedTimeout = 40000; // 40 seconds

        while (Date.now() - startTime < extendedTimeout && !verified) {
          const verificationResult = await checkBalanceUpdate(user?.id!);

          if (verificationResult.success) {
            verified = true;
            // Update frontend state
            updateBalance(verificationResult.newBalance);

            // Add transaction record
            addTransaction({
              amount: amountValue,
              type: "deposit",
              description: `Added funds via bank transfer`,
              status: "completed",
            });

            // Show success page
            setTransactionStatus("completed");
            setStep(3);
            return;
          }

          // Wait 5 seconds between checks
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        // If we get here, verification failed
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

        // Reload after showing final message
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    };

    // Start the extended verification process
    verifyExtended();
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (extendedWaitRef.current) clearTimeout(extendedWaitRef.current);
    };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleContinue = async () => {
    if (!amount || parseFloat(amount) <= 0) {
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

      console.log("New Balance", newBackendBalance);

      // Check if balance has increased by at least the expected amount
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

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return;

    setIsLoading(true);
    setError("");
    setTransactionStatus("pending");
    setCountdownTime(300); // Reset countdown

    try {
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdownTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // Check balance immediately
      let verificationResult = await checkBalanceUpdate(user.id);

      // Continue checking until success or timeout
      while (!verificationResult.success && countdownTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, 20000)); // Check every 20 seconds
        verificationResult = await checkBalanceUpdate(user.id);
      }

      clearInterval(timer);

      if (verificationResult.success) {
        // Update frontend state
        updateBalance(verificationResult.newBalance);

        // Add transaction record
        addTransaction({
          amount: amountValue,
          type: "deposit",
          description: `Added funds via bank transfer`,
          status: "completed",
        });

        // Show success page
        setTransactionStatus("completed");
        setStep(3); // This is the critical line that shows success page
        console.log("Transaction status:", transactionStatus); // Should be "completed"
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
    console.log("Starting verification...");
    await startBalanceVerification();
    console.log("Verification complete, current step:", step);
  };

  // Add this new handler for USD conversion
  const handleConvertToUSD = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!amount || parseFloat(amount) <= 0) {
    //   setError("Please enter a valid amount");
    //   return;
    // }

    // if (parseFloat(amount) > (user?.balance || 0)) {
    //   setError("Insufficient Naira balance");
    //   return;
    // }

    // setIsLoading(true);
    // setError("");

    // try {
    //   // Simulate API call
    //   await new Promise((resolve) => setTimeout(resolve, 1500));

    //   const nairaAmount = parseFloat(amount);
    //   const finalUsdtAmount = nairaAmount * exchangeRate;

    //   // Update balances
    //   if (user) {
    //     updateBalance(user.balance - nairaAmount);
    //     updateUSDTBalance((user.usdtBalance || 0) + finalUsdtAmount);
    //   }

    //   // Add transaction record
    //   addTransaction({
    //     amount: nairaAmount,
    //     type: "exchange",
    //     description: `Converted ${formatCurrency(
    //       nairaAmount
    //     )} to ${finalUsdtAmount.toFixed(2)} USD`,
    //     status: "completed",
    //   });

    //   setStep(3);
    // } catch (err) {
    //   setError("Failed to process conversion. Please try again.");
    //   console.error(err);
    // } finally {
    //   setIsLoading(false);
    // }
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
      {/* <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Funds</h1>
        <p className="text-gray-600 mb-4">Add money to your Rulsar account</p>
      </motion.div> */}

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {activeTab === "add-naira" ? "Add Funds" : "Fund USD Account"}
        </h1>
        <p className="text-gray-600 mb-4">
          {activeTab === "add-naira"
            ? "Add money to your Rulsar account"
            : "Convert Naira to USD"}
        </p>
      </motion.div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "add-naira"
              ? "border-b-2 border-primary-500 text-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("add-naira")}
        >
          Add Naira
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === "convert-to-usdt"
              ? "border-b-2 border-primary-500 text-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("convert-to-usdt")}
        >
          Fund USD
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        {activeTab === "add-naira" ? (
          <>
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
                      <span className="text-gray-500 sm:text-sm">
                        <s>N</s>
                      </span>
                    </div>

                    <input
                      type="text"
                      name="amount"
                      id="amount"
                      className="input pl-8"
                      placeholder="0.00"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(user?.balance || 0)}
                    </p>
                  </div>

                  {/* {amount && parseFloat(amount) > 0 && ( */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                      Transaction Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Amount to deposit:</div>
                      <div className="text-right font-medium">
                        {formatCurrency(parseFloat(amount) || 0)}
                      </div>

                      <div className="text-gray-600">
                        Percentage fee (2.5%):
                      </div>
                      <div className="text-right font-medium">
                        -{formatCurrency(parseFloat(amount) * 0.025 || 0)}
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
                  {/* )} */}
                </div>

                {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className={`border rounded-lg p-3 cursor-pointer transition-all h-fit ${
                    paymentMethod === "card"
                      ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                        paymentMethod === "card"
                          ? "border-primary-500 bg-primary-500"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "card" && (
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                      )}
                    </div>

                    <div className="ml-3 flex items-center">
                      <CardIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        Credit Card
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-3 cursor-pointer transition-all h-fit ${
                    paymentMethod === "bank"
                      ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("bank")}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                        paymentMethod === "bank"
                          ? "border-primary-500 bg-primary-500"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "bank" && (
                        <div className="h-1 w-1 rounded-full bg-white"></div>
                      )}
                    </div>

                    <div className="ml-3 flex items-center">
                      <Banknote className="h-5 w-5 text-gray-400 mr-2" />

                      <span className="font-medium text-gray-900">
                        Bank Transfer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

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
                      {/* {paymentMethod === "card"
                    ? "Card Details"
                    : "Bank Transfer Details"} */}
                    </h2>

                    <div className="bg-gray-100 rounded-full p-2">
                      {/* {paymentMethod === "card" ? (
                    <CreditCard className="h-5 w-5 text-gray-500" />
                  ) : ( */}
                      <Banknote className="h-5 w-5 text-gray-500" />
                      {/* )} */}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-500">See details below.</p>
                    <div className="text-right">
                      <span className="text-sm font-medium text-primary-600">
                        Amount: {formatCurrency(parseFloat(amount) || 0)}
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
                            Click on confirm transfer if you've made the
                            transfer
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg items-center">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          Bank Name:
                        </span>
                        <span className="text-sm font-medium">
                          {user?.bankInformation.bankName}
                        </span>
                      </div>

                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          Account Name:
                        </span>
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

                      {/* <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Routing Number:
                    </span>
                    <span className="text-sm font-medium">987654321</span>
                  </div> */}
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

                        {countdownTime < 30 &&
                          transactionStatus === "pending" && (
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
                                Don't worry - if you made the transfer, it will
                                be processed.
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

                    {transactionStatus === "failed" &&
                      !showExtendedWait &&
                      error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                    {/* <div className="p-4 bg-accent-50 border border-accent-100 rounded-lg">
                  <p className="text-sm text-accent-700">
                    <span className="font-medium">Important:</span> For demo
                    purposes, we'll add the funds immediately after you submit
                    this form. In a real application, you would need to actually
                    make the bank transfer.
                  </p>
                </div> */}
                  </div>

                  {/* {paymentMethod === "card" ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number
                    </label>

                    <input
                      type="text"
                      id="cardNumber"
                      className="input"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={handleCardNumberChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cardName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="input"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="expiry"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Expiry Date
                      </label>

                      <input
                        type="text"
                        id="expiry"
                        className="input"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="cvc"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        className="input"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={handleCVCChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                
              )} */}

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                      }}
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
                    (from {formatCurrency(parseFloat(amount))} after fees)
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
          </>
        ) : (
          <>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Convert Naira to USD
                    </h2>
                    <div className="bg-gray-100 rounded-full p-2">
                      <ArrowRight className="h-3 w-3 text-gray-500" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the amount you want to convert
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
                    Amount (₦)
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
                      value={amount}
                      onChange={handleAmountChange}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Current Naira Balance
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(user?.balance || 0)}
                    </p>
                  </div>

                  {amount && parseFloat(amount) > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800 mb-1">
                        Conversion Details
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Amount to convert:</div>
                        <div className="text-right font-medium">
                          {formatCurrency(parseFloat(amount))}
                        </div>
                        <div className="text-gray-600">Exchange rate:</div>
                        <div className="text-right font-medium">
                          1 USD = ₦{exchangeRate.toFixed(2)}
                        </div>
                        <div className="text-gray-600 font-semibold">
                          You'll receive:
                        </div>
                        <div className="text-right font-semibold text-blue-600">
                          {usdtAmount.toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    // disabled={!amount || parseFloat(amount) <= 0}
                    disabled
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn btn-primary px-6"
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
                      Confirm Conversion
                    </h2>
                    <div className="bg-gray-100 rounded-full p-2">
                      <Coins className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleConvertToUSD}>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
                      <h3 className="font-medium text-primary-800 mb-2">
                        Conversion Summary
                      </h3>
                      <div className="flex items-center justify-between py-3 border-b border-primary-100">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium">
                          {formatCurrency(parseFloat(amount))} NGN
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium">
                          {usdtAmount.toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          Current Naira Balance:
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(user?.balance || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          After Conversion:
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(
                            (user?.balance || 0) - parseFloat(amount)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          USD Balance After:
                        </span>

                        <span className="text-sm font-medium">
                          {(0 + usdtAmount).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
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
                      {isLoading ? "Processing..." : "Confirm Conversion"}
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
                  Conversion Successful!
                </h2>
                <p className="text-gray-600 mb-4">
                  You've received {usdtAmount.toFixed(2)} USD
                  <span className="block text-sm text-gray-500 mt-1">
                    (from {formatCurrency(parseFloat(amount))} NGN)
                  </span>
                </p>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4 inline-block">
                  <div className="flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary-600 mr-2" />
                    <span className="font-medium text-gray-900">
                      New USD Balance: {(0).toFixed(2)} USD
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
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AddFunds;
