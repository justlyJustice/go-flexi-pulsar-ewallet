import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Landmark,
  Send,
  User,
  DollarSign,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

import { AddBeneficiaryModal } from "../components/AddBeneficiaryModal";
import { Beneficiary, useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { formatCurrency } from "../utils/formatters";
// import { useBankStore } from "../stores/banksStore";

import { transferFunds } from "../services/transfer";
import { getUpdatedUser } from "../services/add-funds";

const Transfer: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const [selectedBeneficiaryID, setSelectedBeneficiaryID] = useState("");

  const [values, setValues] = useState({
    account_number: "",
    amount: "",
    bank_name: "",
    name_enquiry_reference: "",
    narration: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [addBeneficiary, setAddBeneficiary] = useState(false);
  const [transferLimits, setTransferLimits] = useState({
    daily: { limit: 50000, used: 0, lastReset: null as Date | null },
    monthly: { limit: 250000, used: 0, lastReset: null as Date | null },
    lastTransferTime: null as Date | null,
    cooldownHours: 5,
  });
  const TRANSFER_FEE = 20;

  // Initialize transfer limits from user data
  useEffect(() => {
    if (user) {
      setTransferLimits({
        daily: {
          limit: user.dailyTransferLimit || 50000,
          used: user.dailyTransferAmount || 0,
          lastReset: user.lastDailyReset ? new Date(user.lastDailyReset) : null,
        },
        monthly: {
          limit: user.monthlyTransferLimit || 250000,
          used: user.monthlyTransferAmount || 0,
          lastReset: user.lastMonthlyReset
            ? new Date(user.lastMonthlyReset)
            : null,
        },
        lastTransferTime: user.lastTransferTime
          ? new Date(user.lastTransferTime)
          : null,
        cooldownHours: 5,
      });
    }
  }, [user]);

  // Calculate time remaining for cooldown
  const getCooldownRemaining = () => {
    if (!transferLimits.lastTransferTime) return null;

    const now = new Date();
    const cooldownMs = transferLimits.cooldownHours * 60 * 60 * 1000;
    const nextTransferTime = new Date(
      transferLimits.lastTransferTime.getTime() + cooldownMs
    );

    if (now < nextTransferTime) {
      const diffMs = nextTransferTime.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }

    return null;
  };

  const cooldownRemaining = getCooldownRemaining();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setValues((prevValues) => ({ ...prevValues, [name]: value }));
    }
  };

  const handleContinue = () => {
    const {
      account_number,
      amount,
      bank_name,
      name_enquiry_reference,
      narration,
    } = values;

    if (
      !account_number ||
      !amount ||
      !bank_name ||
      !name_enquiry_reference ||
      !narration
    ) {
      setError("All fields are required");
      return toast.error("All fields are required");
    }

    if (user?.balance! < parseFloat(amount)) {
      toast.error("Insufficient balance");
      return setError("Insufficient balance");
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(values.amount);

    if (user?.balance! < amountValue) {
      setError("Not enough funds.");
      toast.error("Not enough funds!");

      return setTimeout(() => {
        setError("");
      }, 5000);
    }

    // Client-side validation
    if (amountValue > 10000) {
      setError("Maximum single transfer is ₦10,000");
      return toast.error("Maximum single transfer is ₦10,000");
    }

    try {
      setIsLoading(true);
      const res = await transferFunds({
        ...values,
        amount: String(amountValue),
      });

      if (!res.ok) {
        setError(res.data?.error || "Transfer failed");
        toast.error(res.data?.error || "Transfer failed");
        setIsLoading(false);

        setTimeout(() => {
          setError("");
        }, 5000);
      } else {
        toast.success(res.data?.message!);

        const userRes = await getUpdatedUser(user?.id!);
        const updatedUser = userRes.data!.user;
        setIsLoading(false);

        if (res.ok) {
          updateUser({
            ...updatedUser,
            balance: userRes.data?.user.accountBalance,
          });

          // Update local state
          setTransferLimits({
            daily: {
              limit: userRes.data?.user.dailyTransferLimit || 50000,
              used: userRes.data?.user.dailyTransferAmount || 0,
              lastReset: userRes.data?.user.lastDailyReset
                ? new Date(userRes.data?.user.lastDailyReset)
                : null,
            },
            monthly: {
              limit: userRes.data?.user.monthlyTransferLimit || 250000,
              used: userRes.data?.user.monthlyTransferAmount || 0,
              lastReset: userRes.data?.user.lastMonthlyReset
                ? new Date(userRes.data?.user.lastMonthlyReset)
                : null,
            },
            lastTransferTime: userRes.data?.user.lastTranserTime
              ? new Date(userRes.data?.user.lastTranserTime)
              : new Date(),
            cooldownHours: 5,
          });

          // Add transaction
          addTransaction({
            amount: amountValue,
            type: "transfer-out",
            description:
              values.narration ||
              `Transfer to ${values.name_enquiry_reference}`,
            recipient: values.name_enquiry_reference,
            status: "completed",
          });

          // Go to success step
          setStep(3);
        } else {
          setError(userRes?.data!.error || "Error getting user");
          toast.error(userRes?.data!.error || "Error getting user");
          setIsLoading(false);

          setTimeout(() => {
            setError("");
          }, 5000);
        }
      }
    } catch (err: any) {
      setError(err.message || "Transaction failed. Please try again.");
      toast.error(err.message || "Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
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

  const selectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiaryID(beneficiary._id);

    setValues((prev) => ({
      ...prev,
      account_number: beneficiary.accountNumber,
      bank_name: beneficiary.bankName,
      name_enquiry_reference: beneficiary.accountName,
    }));
  };

  const isDailyExceeded = transferLimits.daily.used === 50000;
  const isMonthlyExceeded = transferLimits.monthly.used === 250000;
  const isCooldownActive = () => getCooldownRemaining() !== null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-2xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Transfer Funds
        </h1>
        <p className="text-gray-600 mb-6">
          Send money to friends, family, or businesses
        </p>
      </motion.div>

      <AddBeneficiaryModal
        onClose={() => setAddBeneficiary(false)}
        title="Add New Beneficiary"
        description="Enter beneficiary information below"
        isOpen={addBeneficiary}
      />

      <div className="bg-white rounded-card shadow-card p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Transfer Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    Select existing or add a new beneficiary
                  </p>
                </div>

                <div className="bg-gray-100 rounded-full p-2">
                  <Send className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {user?.beneficiaries && user?.beneficiaries.length > 0 && (
              <div className="my-2 space-y-2">
                {user.beneficiaries.map((beneficiary: Beneficiary, i) => (
                  <div
                    className={`${
                      beneficiary._id === selectedBeneficiaryID
                        ? "outline-2 outline outline-primary-500"
                        : ""
                    } p-2 bg-gray-50 border border-gray-200 rounded-lg`}
                    key={i}
                    onClick={() => selectBeneficiary(beneficiary)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <User className="h-2 w-2 text-primary-600" />
                        </div>

                        <div className="ml-3">
                          <h4 className="font-bold">
                            {beneficiary.accountName}
                          </h4>

                          <p className="text-sm font-medium text-gray-900 flex">
                            NGN <Landmark className="w-2 h-2 mx-1.5" />{" "}
                            {beneficiary.accountNumber}
                          </p>

                          <p className="text-xs text-gray-500">
                            {beneficiary.bankName}
                          </p>
                        </div>
                      </div>

                      <button
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        onClick={() => selectBeneficiary(beneficiary)}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn text-primary rounded-lg mb-2 flex items-center gap-2"
              onClick={() => setAddBeneficiary(true)}
            >
              <Plus className="h-2 w-2" />
              Add Beneficiary
            </button>

            <div className="space-y-1">
              <div>
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
                    value={values.amount}
                    onChange={handleAmountChange}
                    max={10000}
                    required
                  />
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(user?.balance || 0)}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="narration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Narration
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <MessageSquare className="h-3 w-2 text-gray-400" />
                  </div>

                  <input
                    type="text"
                    id="narration"
                    name="narration"
                    className="input pl-10"
                    placeholder="What's this for?"
                    value={values.narration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setValues((prev) => ({
                        ...prev,
                        narration: e.target.value,
                      }));
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="my-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Transaction Limits
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Max Single Transfer:</div>
                <div className="text-right font-medium">
                  {formatCurrency(10000)}
                </div>

                <div className="text-gray-600">Daily Limit:</div>
                <div className="text-right font-medium">
                  {formatCurrency(transferLimits.daily.used)} /{" "}
                  {formatCurrency(transferLimits.daily.limit)}
                  <div className="text-xs text-gray-500">
                    Resets: {formatDate(transferLimits.daily.lastReset)}
                  </div>
                </div>

                <div className="text-gray-600">Monthly Limit:</div>
                <div className="text-right font-medium">
                  {formatCurrency(transferLimits.monthly.used)} /{" "}
                  {formatCurrency(transferLimits.monthly.limit)}
                  <div className="text-xs text-gray-500">
                    Resets: {formatDate(transferLimits.monthly.lastReset)}
                  </div>
                </div>

                <div className="text-gray-600">Transfer Cooldown:</div>
                <div className="text-right font-medium">
                  {cooldownRemaining
                    ? cooldownRemaining + " left"
                    : "Ready to transfer"}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={
                  isLoading ||
                  isDailyExceeded ||
                  isMonthlyExceeded ||
                  isCooldownActive()
                }
                type="button"
                onClick={handleContinue}
                className={`btn btn-primary px-6 ${
                  isLoading ||
                  isDailyExceeded ||
                  isMonthlyExceeded ||
                  isCooldownActive()
                    ? "disabled btn-primary-100"
                    : ""
                }`}
              >
                {!isLoading ? (
                  "Continue"
                ) : (
                  <span className="flex items-center">
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

                    <span>Verifying...</span>
                  </span>
                )}
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
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Confirm Transfer
                  </h2>

                  <p className="text-sm text-gray-500">
                    Please review the details before confirming
                  </p>
                </div>

                <div className="bg-gray-100 rounded-full p-2">
                  <Send className="h-3 w-3 text-gray-500" />
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account Name</span>
                  <span className="text-sm font-medium text-gray-900">
                    {values.name_enquiry_reference}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account Number</span>
                  <span className="text-sm font-medium text-gray-900">
                    {values.account_number}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Bank Name</span>
                  <span className="text-sm font-medium text-gray-900">
                    {values.bank_name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(parseFloat(values.amount) || 0)}
                  </span>
                </div>

                {values.narration && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Description</span>
                    <span className="text-sm font-medium text-gray-900">
                      {values.narration}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(TRANSFER_FEE)}
                  </span>
                </div>

                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-700">
                    {formatCurrency(
                      parseFloat(values.amount) + TRANSFER_FEE || 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-accent-50 border border-accent-100 rounded-lg p-2 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-accent-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="ml-3">
                  <p className="text-sm text-accent-700">
                    By confirming this transfer, you agree that the recipient
                    details are correct. This transaction cannot be reversed
                    once completed.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-outline"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
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
                    Processing...
                  </div>
                ) : (
                  "Confirm Transfer"
                )}
              </button>
            </div>
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
              Transfer Successful!
            </h2>

            <p className="text-gray-600 mb-4">
              {formatCurrency(parseFloat(values.amount))} has been sent to{" "}
              {values.name_enquiry_reference}
            </p>

            <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg mb-6 inline-block">
              <div className="flex items-center justify-center">
                <DollarSign className="h-4 w-3 text-primary-600 mr-2" />
                <span className="font-medium text-gray-900">
                  New Balance: {formatCurrency(user?.balance || 0)}
                </span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setValues({
                    account_number: "",
                    amount: "",
                    bank_name: "",
                    name_enquiry_reference: "",
                    narration: "",
                  });
                  setStep(1);
                }}
                className="btn btn-outline flex items-center"
              >
                <Send className="h-2 w-2 mr-2" />
                New Transfer
              </button>

              <button
                type="button"
                onClick={handleGoToDashboard}
                className="btn btn-primary flex items-center"
              >
                Dashboard
                <ArrowRight className="h-2 w-2 ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Transfer;
