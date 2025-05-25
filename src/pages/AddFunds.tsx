import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  // CreditCard as CardIcon,
  Coins,
  Banknote,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { formatCurrency } from "../utils/formatters";
import { getUpdatedUserBalance } from "../services/add-funds";

const AddFunds: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuthStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [amount, setAmount] = useState("");
  // const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [countdownTime, setCountdownTime] = useState(60);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "completed" | "failed"
  >("pending");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // const [cardDetails, setCardDetails] = useState({
  //   number: "",
  //   fullName: "",
  //   expiry: "",
  //   cvc: "",
  // });

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
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // Add this useEffect to handle countdown timeout
  useEffect(() => {
    if (countdownTime === 0 && isLoading) {
      // Time is up and still loading
      handleTimeout();
    }
  }, [countdownTime, isLoading]);

  const handleTimeout = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Set error state
    setTransactionStatus("failed");
    setError(
      "We couldn't verify your transfer in time. The page will refresh shortly..."
    );
    setIsLoading(false);

    // Reload the page after 5 seconds
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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

  // const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value.replace(/\D/g, "").substring(0, 16);
  //   // Format with spaces every 4 digits
  //   const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  //   setCardDetails({ ...cardDetails, number: formatted });
  // };

  // const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value.replace(/\D/g, "");
  //   if (value.length <= 4) {
  //     // Format as MM/YY
  //     const formatted =
  //       value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
  //     setCardDetails({ ...cardDetails, expiry: formatted });
  //   }
  // };

  // const handleCVCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value.replace(/\D/g, "").substring(0, 3);
  //   setCardDetails({ ...cardDetails, cvc: value });
  // };

  const checkBalanceUpdate = async (
    userId: string,
    expectedIncrease: number
  ) => {
    try {
      const res = await getUpdatedUserBalance(userId);

      if (!res.ok) {
        throw new Error("Failed to fetch updated balance");
      }

      const currentFrontendBalance = user?.balance || 0;
      const newBackendBalance = res.data?.user.accountBalance;

      // Check if balance has increased by at least the expected amount
      if (newBackendBalance >= currentFrontendBalance + expectedIncrease) {
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
    if (isNaN(amountValue)) return;

    // Reset countdown for new verification attempt
    // setCountdownTime(90);
    setIsLoading(true);
    setError("");
    setTransactionStatus("pending");

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          return 0; // Will trigger the timeout useEffect
        }
        return prev - 1;
      });
    }, 1000);

    try {
      let verificationResult = await checkBalanceUpdate(user.id, amountValue);

      // Poll every 10 seconds until success or timeout
      while (!verificationResult.success && countdownTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        verificationResult = await checkBalanceUpdate(user.id, amountValue);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (verificationResult.success) {
        // Success case remains the same
        updateBalance(verificationResult.newBalance);
        addTransaction({
          amount: amountValue,
          type: "deposit",
          description: `Added funds via bank transfer`,
          status: "completed",
        });
        setTransactionStatus("completed");
        setStep(3);
      } else {
        // This will be handled by the timeout useEffect
      }
    } catch (error) {
      console.log(error);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTransactionStatus("failed");
      setError(
        "An error occurred while verifying your transfer. The page will refresh..."
      );
      setIsLoading(false);

      // Reload after error display
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await startBalanceVerification();

    // setTimeout(() => {
    //   countdownRef.current - 1;
    // }, 1000);

    // if (paymentMethod === "card") {
    //   // Validate card details
    //   if (cardDetails.number.replace(/\s/g, "").length !== 16) {
    //     setError("Please enter a valid card number");
    //     return;
    //   }

    //   if (!cardDetails.name) {
    //     setError("Please enter the cardholder name");
    //     return;
    //   }

    //   if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
    //     setError("Please enter a valid expiry date (MM/YY)");
    //     return;
    //   }

    //   if (cardDetails.cvc.length !== 3) {
    //     setError("Please enter a valid CVC");
    //     return;
    //   }
    // }

    // setIsLoading(true);
    // setError("");

    // try {
    //   const interval = setTimeout(() => {
    //     setCountdownTime((prev) => prev - 1);
    //   }, 1000);

    //   const res = await getUpdatedUserBalance(user?.id!);

    //   if (res.ok) {
    //     console.log(res.data);
    //     clearInterval(interval);
    //     // setStep()
    //   }

    //   if (!res.ok) {
    //     console.log(res);
    //     return toast.error("Something went wrong");
    //     clearInterval(interval);
    //   }

    //   // Simulate API call
    //   // await new Promise((resolve) => setTimeout(resolve, 1500));

    //   // const amountValue = parseFloat(amount);

    //   // // Update user balance
    //   // updateBalance(amountValue);

    //   // // Add transaction
    //   // addTransaction({
    //   //   amount: amountValue,
    //   //   type: "deposit",
    //   //   description: `Added funds`,
    //   //   status: "completed",
    //   // });

    //   // // Go to success step
    //   // setStep(3);
    // } catch (err) {
    //   setError("Transaction failed. Please try again.");
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Funds</h1>
        <p className="text-gray-600 mb-4">Add money to your Pulsar account</p>
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

                  <div className="text-gray-600">Percentage fee (2.5%):</div>
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
      </div>
    </motion.div>
  );
};

export default AddFunds;
