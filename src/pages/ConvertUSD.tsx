import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Coins,
  Wallet,
  // ArrowRight,
  ArrowUpDown,
  Repeat,
  Info,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { formatCurrency } from "../utils/formatters";
import { fundUsdAccount, getUsdStatus } from "../services/add-funds";
import { getExchangeRates } from "../services/virtual-card";
import LoadingOverlay from "../components/LoadingOverlay";
import toast from "react-hot-toast";
import { toNamespacedPath } from "path";

type ConversionDirection = "NGN_TO_USD" | "USD_TO_NGN";
type FundingStatus = "pending" | "successful" | "failed" | "idle";

// Fee constants
const USDT_DEPOSIT_FEE = 0.5; // Fixed fee in USD
const PERCENT_DEPOSIT_FEE = 1.9; // Percentage fee (1.9%)

const PENDING_CONVERSION_KEY = "pending_usd_conversion";

const ConvertUSD: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [sourceAmount, setSourceAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingExchangeRate, setIsGettingExchangeRate] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [exchangeRate, setExchangeRate] = useState(0);
  const [conversionDirection, setConversionDirection] =
    useState<ConversionDirection>("NGN_TO_USD");
  const [fundingStatus, setFundingStatus] = useState<FundingStatus>("idle");
  const [conversionReference, setConversionReference] = useState<string>("");
  const [checkingInterval, setCheckingInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setIsGettingExchangeRate(true);
        const res = await getExchangeRates();
        setIsGettingExchangeRate(false);

        if (!res.ok) {
          toast.error("Could not get exchange rate!");
          setError("Could not get exchange rate!");
          return setTimeout(() => {
            setError("");
          }, 3000);
        }

        const data = res.data?.data;
        setExchangeRate(Math.abs(Number(data?.rate!)));
      } catch (err) {
        console.error("Failed to get exchange rate:", err);
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const checkPendingConversion = async () => {
      const pending = getPendingConversion();
      if (pending) {
        setConversionReference(pending.reference);
        setSourceAmount(pending.sourceAmount);
        setTargetAmount(pending.netAmount);
        setConversionDirection(pending.direction);
        setFundingStatus("pending");
        setStep(3);

        // Start checking status
        startStatusChecking(pending.reference);
      }
    };

    checkPendingConversion();

    // Cleanup interval on unmount
    return () => {
      if (checkingInterval) {
        clearInterval(checkingInterval);
      }
    };
  }, []);

  interface PendingConversion {
    reference: string;
    sourceAmount: string;
    netAmount: number;
    direction: ConversionDirection;
    timestamp: number;
  }

  // Calculate fees and net amount
  const { netAmount, usdAmountBeforeFees, fees } = useMemo(() => {
    const amountValue = parseFloat(sourceAmount) || 0;

    if (conversionDirection === "NGN_TO_USD") {
      // For NGN to USD: Calculate USD amount first, then apply fees
      const usdAmountBeforeFees = amountValue / exchangeRate;
      const percentageFee = (usdAmountBeforeFees * PERCENT_DEPOSIT_FEE) / 100;
      const totalFees = percentageFee + USDT_DEPOSIT_FEE;
      const netUsdAmount = Math.max(0, usdAmountBeforeFees - totalFees);

      return {
        usdAmountBeforeFees: Number(usdAmountBeforeFees.toFixed(2)),
        netAmount: Number(netUsdAmount.toFixed(2)),
        fees: {
          percentageFee: Number(percentageFee.toFixed(2)),
          fixedFee: USDT_DEPOSIT_FEE,
          totalFee: Number(totalFees.toFixed(2)),
        },
      };
    } else {
      // For USD to NGN: Apply fees to USD amount, then convert to NGN
      const percentageFee = (amountValue * PERCENT_DEPOSIT_FEE) / 100;
      const totalFees = percentageFee + USDT_DEPOSIT_FEE;
      const netUsdAmount = Math.max(0, amountValue - totalFees);
      const netNairaAmount = netUsdAmount * exchangeRate;

      return {
        netAmount: Number(netNairaAmount.toFixed(2)),
        fees: {
          percentageFee: Number(percentageFee.toFixed(2)),
          fixedFee: USDT_DEPOSIT_FEE,
          totalFee: Number(totalFees.toFixed(2)),
        },
      };
    }
  }, [sourceAmount, exchangeRate, conversionDirection]);

  // Update target amount when net amount changes
  useEffect(() => {
    setTargetAmount(
      conversionDirection === "NGN_TO_USD" ? usdAmountBeforeFees! : netAmount
    );
  }, [netAmount]);

  const getStatusIcon = () => {
    switch (fundingStatus) {
      case "successful":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "pending":
        return (
          <div className="relative">
            <Clock className="h-12 w-12 text-blue-500 animate-pulse" />
          </div>
        );
      case "failed":
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return <CheckCircle className="h-12 w-12 text-green-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (fundingStatus) {
      case "successful":
        return "Conversion Successful!";
      case "pending":
        return "Processing Conversion...";
      case "failed":
        return "Conversion Failed";
      default:
        return "Conversion Successful!";
    }
  };

  const getStatusDescription = () => {
    switch (fundingStatus) {
      case "successful":
        return `You've received ${formatCurrency(
          netAmount,
          getTargetCurrency()
        )}`;
      case "pending":
        return "Your conversion is being processed. This may take a few moments...";
      case "failed":
        return "There was an issue processing your conversion. Please try again.";
      default:
        return `You've received ${formatCurrency(
          netAmount,
          getTargetCurrency()
        )}`;
    }
  };

  // Get current balance based on conversion direction
  const getCurrentBalance = () => {
    if (conversionDirection === "NGN_TO_USD") {
      return user?.balance || 0; // NGN balance
    } else {
      return user?.usdtBalance || 0; // USD balance
    }
  };

  // Get target balance based on conversion direction
  const getTargetBalance = () => {
    if (conversionDirection === "NGN_TO_USD") {
      return user?.usdtBalance || 0; // USD balance
    } else {
      return user?.balance || 0; // NGN balance
    }
  };

  const handleRetryConversion = () => {
    setFundingStatus("idle");
    setError("");
    setStep(1);
  };

  const handleSourceAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setSourceAmount(value);
    }
  };

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      const amountValue = parseFloat(value) || 0;
      setTargetAmount(amountValue);

      // Recalculate source amount based on target amount and fees
      if (conversionDirection === "NGN_TO_USD") {
        // Target is USD (net amount), calculate source NGN
        // netAmount = (sourceAmount / exchangeRate) * (1 - PERCENT_DEPOSIT_FEE/100) - USDT_DEPOSIT_FEE
        // So: sourceAmount = (netAmount + USDT_DEPOSIT_FEE) * exchangeRate / (1 - PERCENT_DEPOSIT_FEE/100)
        const requiredUsdBeforeFees =
          (amountValue + USDT_DEPOSIT_FEE) / (1 - PERCENT_DEPOSIT_FEE / 100);
        const calculatedSource = Number(
          (requiredUsdBeforeFees * exchangeRate).toFixed(2)
        );
        setSourceAmount(calculatedSource.toString());
      }
    }
  };

  const toggleConversionDirection = () => {
    setConversionDirection((prev) =>
      prev === "NGN_TO_USD" ? "USD_TO_NGN" : "NGN_TO_USD"
    );
    // Reset amounts when toggling direction
    setSourceAmount("");
    setTargetAmount(0);
    setError("");
  };

  const validateConversion = () => {
    if (!sourceAmount || parseFloat(sourceAmount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    const sourceBalance = getCurrentBalance();

    if (parseFloat(sourceAmount) > sourceBalance) {
      setError(
        `Insufficient ${
          conversionDirection === "NGN_TO_USD" ? "Naira" : "USD"
        } balance`
      );

      return false;
    }

    // Validate that net amount is positive after fees
    if (netAmount <= 0) {
      setError("Amount too small to cover conversion fees");
      return false;
    }

    return true;
  };

  const getPendingConversion = (): PendingConversion | null => {
    try {
      const pending = localStorage.getItem(PENDING_CONVERSION_KEY);
      return pending ? JSON.parse(pending) : null;
    } catch (error) {
      console.error("Error reading pending conversion:", error);
      return null;
    }
  };

  const setPendingConversion = (conversion: PendingConversion) => {
    try {
      localStorage.setItem(PENDING_CONVERSION_KEY, JSON.stringify(conversion));
    } catch (error) {
      console.error("Error saving pending conversion:", error);
    }
  };

  const clearPendingConversion = () => {
    try {
      localStorage.removeItem(PENDING_CONVERSION_KEY);
    } catch (error) {
      console.error("Error clearing pending conversion:", error);
    }
  };

  const startStatusChecking = (reference: string) => {
    // Clear any existing interval
    if (checkingInterval) {
      clearInterval(checkingInterval);
    }

    const interval = setInterval(async () => {
      await checkFundingStatus(reference);
    }, 5000); // Check every 5 seconds

    setCheckingInterval(interval);
  };

  const stopStatusChecking = () => {
    if (checkingInterval) {
      clearInterval(checkingInterval);
      setCheckingInterval(null);
    }
  };

  const checkFundingStatus = async (reference: string) => {
    try {
      const usdRes = await getUsdStatus(reference);

      if (usdRes.ok) {
        const status = usdRes.data?.status?.toLowerCase();

        if (status === "successful" || status === "completed") {
          setFundingStatus("successful");
          stopStatusChecking();
          clearPendingConversion();

          // Update user balance if needed
          // You might want to refresh user data here
          toast.success("USD funding completed successfully!");
        } else if (status === "failed" || status === "rejected") {
          setFundingStatus("failed");
          stopStatusChecking();
          clearPendingConversion();
          setError("USD funding failed. Please try again.");
        }
      } else {
        console.error("Error checking funding status:", usdRes.data?.error);
      }
    } catch (err) {
      console.error("Failed to check funding status:", err);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const getSourceCurrency = () =>
    conversionDirection === "NGN_TO_USD" ? "NGN" : "USD";
  const getTargetCurrency = () =>
    conversionDirection === "NGN_TO_USD" ? "USD" : "NGN";

  const getSourceCurrencySymbol = () =>
    conversionDirection === "NGN_TO_USD" ? "₦" : "$";
  const getTargetCurrencySymbol = () =>
    conversionDirection === "NGN_TO_USD" ? "$" : "₦";

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

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateConversion()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setFundingStatus("pending");

    try {
      if (conversionDirection === "NGN_TO_USD") {
        // NGN to USD conversion
        const res = await fundUsdAccount(netAmount);

        if (!res.ok) {
          setError(res.data?.error!);
          setFundingStatus("failed");

          setTimeout(() => {
            setError("");
          }, 3000);

          return toast.error(res.data?.error!);
        }

        if (res.ok) {
          const reference = res.data?.reference;
          if (reference) {
            setConversionReference(reference);

            // Store in local storage
            const pendingConversion: PendingConversion = {
              reference,
              sourceAmount,
              netAmount,
              direction: conversionDirection,
              timestamp: Date.now(),
            };
            setPendingConversion(pendingConversion);

            // Start checking status
            startStatusChecking(reference);

            setStep(3);
          } else {
            setError("No reference received from server");
            setFundingStatus("failed");
          }
        }
      }
    } catch (err) {
      setError("Failed to process conversion. Please try again.");
      setFundingStatus("failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-2xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Currency Conversion
        </h1>
        <p className="text-gray-600 mb-4">Convert between Naira and USD</p>
      </motion.div>

      <LoadingOverlay show={isGettingExchangeRate} />

      <div className="bg-white rounded-card shadow-card p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {conversionDirection === "NGN_TO_USD"
                      ? "Convert Naira to USD"
                      : "Convert USD to Naira"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the amount you want to convert
                  </p>
                </div>
                <div className="bg-gray-100 rounded-full p-2">
                  <Repeat className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="space-y-4">
                {/* Source Currency Input */}
                <div>
                  <label
                    htmlFor="sourceAmount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {getSourceCurrency()} Amount ({getSourceCurrencySymbol()})
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {getSourceCurrencySymbol()}
                      </span>
                    </div>
                    <input
                      type="text"
                      name="sourceAmount"
                      id="sourceAmount"
                      className="input pl-8"
                      placeholder="0.00"
                      value={sourceAmount}
                      onChange={handleSourceAmountChange}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Current {getSourceCurrency()} Balance
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(getCurrentBalance(), getSourceCurrency())}
                    </p>
                  </div>
                </div>

                {/* Conversion Toggle */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={toggleConversionDirection}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full p-3 cursor-pointer transition-colors"
                    title={`Switch to ${
                      conversionDirection === "NGN_TO_USD"
                        ? "USD to NGN"
                        : "NGN to USD"
                    }`}
                  >
                    <ArrowUpDown className="text-gray-600 w-3 h-3" />
                  </button>
                </div>

                {/* Target Currency Input */}
                <div>
                  <label
                    htmlFor="targetAmount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {getTargetCurrency()} Amount ({getTargetCurrencySymbol()})
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {getTargetCurrencySymbol()}
                      </span>
                    </div>
                    <input
                      type="text"
                      name="targetAmount"
                      id="targetAmount"
                      className="input pl-8"
                      placeholder="0.00"
                      value={targetAmount}
                      onChange={handleTargetAmountChange}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Current {getTargetCurrency()} Balance
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(getTargetBalance(), getTargetCurrency())}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conversion Details with Fees */}
              {sourceAmount && parseFloat(sourceAmount) > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Conversion Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount to convert:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          parseFloat(sourceAmount),
                          getSourceCurrency()
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange rate:</span>
                      <span className="font-medium">
                        {conversionDirection === "NGN_TO_USD"
                          ? `1 USD = ₦${exchangeRate.toFixed(2)}`
                          : `1 NGN = $${(1 / exchangeRate).toFixed(4)}`}
                      </span>
                    </div>

                    {conversionDirection === "NGN_TO_USD" && (
                      <div className="border-t border-blue-200 pt-2">
                        <div className="flex justify-between text-red-600">
                          <span>Percentage fee ({PERCENT_DEPOSIT_FEE}%):</span>
                          <span>
                            -{formatCurrency(fees.percentageFee, "USD")}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Fixed fee:</span>
                          <span>-{formatCurrency(fees.fixedFee, "USD")}</span>
                        </div>
                        <div className="flex justify-between text-red-600 border-t border-blue-200 pt-1">
                          <span className="font-medium">Total fees:</span>
                          <span className="font-medium">
                            -{formatCurrency(fees.totalFee, "USD")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="text-gray-600 font-semibold">
                        You'll receive:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(netAmount, getTargetCurrency())}
                      </span>
                    </div>
                  </div>

                  {/* Minimum amount warning */}
                  {netAmount <= 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Amount is too small to cover conversion fees
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (conversionDirection === "NGN_TO_USD" && netAmount < 3) {
                    return toast.error(
                      "USD Amount after charges must be $3 and above"
                    );
                  }

                  setStep(2);
                }}
                className="btn btn-primary text-white px-4"
                disabled={
                  !sourceAmount ||
                  parseFloat(sourceAmount) <= 0 ||
                  netAmount <= 0
                }
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
                  <Coins className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleConvert}>
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
                  <h3 className="font-medium text-primary-800 mb-2">
                    Conversion Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-primary-100">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          parseFloat(sourceAmount),
                          getSourceCurrency()
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-primary-100">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium">
                        {formatCurrency(netAmount, getTargetCurrency())}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-sm text-red-600">
                      <span>Total fees:</span>
                      <span>-{formatCurrency(fees.totalFee, "USD")}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Current {getSourceCurrency()} Balance:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(getCurrentBalance(), getSourceCurrency())}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      After Conversion:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(
                        getCurrentBalance() - parseFloat(sourceAmount),
                        getSourceCurrency()
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      {getTargetCurrency()} Balance After:
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(
                        getTargetBalance() + netAmount,
                        getTargetCurrency()
                      )}
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
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                {getStatusIcon()}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getStatusMessage()}
            </h2>

            <p className="text-gray-600 mb-4">
              {getStatusDescription()}
              {fundingStatus === "successful" && (
                <span className="block text-sm text-gray-500 mt-1">
                  (from{" "}
                  {formatCurrency(
                    parseFloat(sourceAmount),
                    getSourceCurrency()
                  )}
                  )
                </span>
              )}
            </p>

            {fundingStatus === "pending" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  We're processing your conversion. You can safely leave this
                  page and we'll notify you when it's complete.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Reference: {conversionReference}
                </p>
              </div>
            )}

            {fundingStatus === "failed" && error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {fundingStatus === "successful" && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4 inline-block">
                <div className="flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="font-medium text-gray-900">
                    New {getTargetCurrency()} Balance:{" "}
                    {formatCurrency(
                      getTargetBalance() + netAmount,
                      getTargetCurrency()
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              {fundingStatus === "failed" ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetryConversion}
                    className="btn btn-primary px-6"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToDashboard}
                    className="btn btn-outline"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : fundingStatus === "successful" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setSourceAmount("");
                      setTargetAmount(0);
                      setFundingStatus("idle");
                    }}
                    className="btn btn-outline"
                  >
                    Convert More
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToDashboard}
                    className="btn btn-primary px-6"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                // Pending state
                <>
                  <button
                    type="button"
                    onClick={handleGoToDashboard}
                    className="btn btn-outline"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Force check status
                      if (conversionReference) {
                        checkFundingStatus(conversionReference);
                      }
                    }}
                    className="btn btn-primary px-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Checking..." : "Check Status"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
        {/* 
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
              You've received {formatCurrency(netAmount, getTargetCurrency())}
              <span className="block text-sm text-gray-500 mt-1">
                (from{" "}
                {formatCurrency(parseFloat(sourceAmount), getSourceCurrency())})
              </span>
            </p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4 inline-block">
              <div className="flex items-center justify-center">
                <Wallet className="h-2 w-2 text-primary-600 mr-2" />

                <span className="font-medium text-gray-900">
                  New {getTargetCurrency()} Balance:{" "}
                  {formatCurrency(
                    getTargetBalance() + netAmount,
                    getTargetCurrency()
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSourceAmount("");
                  setTargetAmount(0);
                }}
                className="btn btn-outline"
              >
                Convert More
              </button>
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="btn btn-primary px-6"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )} */}
      </div>
    </motion.div>
  );
};

export default ConvertUSD;
