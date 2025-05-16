import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  User,
  DollarSign,
  MessageSquare,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { formatCurrency } from "../utils/formatters";

const Transfer: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuthStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleContinue = () => {
    if (!recipient.trim()) {
      setError("Please enter a valid recipient email");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const amountValue = parseFloat(amount);

    if ((user?.balance || 0) < amountValue) {
      setError("Insufficient balance");
      return;
    }

    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);

    if (!recipient || !amount || amountValue <= 0) {
      setError("Please fill in all required fields");
      return;
    }

    if ((user?.balance || 0) < amountValue) {
      setError("Insufficient balance");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update user balance
      updateBalance(-amountValue);

      // Add transaction
      addTransaction({
        amount: amountValue,
        type: "transfer-out",
        description: description || `Transfer to ${recipient}`,
        recipient,
        status: "completed",
      });

      // Go to success step
      setStep(3);
    } catch (err) {
      setError("Transaction failed. Please try again.");
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

  const recentContacts = [
    { email: "john@example.com", name: "John Doe" },
    { email: "jane@example.com", name: "Jane Smith" },
    { email: "mike@example.com", name: "Mike Johnson" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-2xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Transfer Funds
        </h1>
        <p className="text-gray-600 mb-6">
          Send money to friends, family, or businesses
        </p>
      </motion.div>

      <div className="bg-white rounded-card shadow-card p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transfer Details
                </h2>
                <div className="bg-gray-100 rounded-full p-2">
                  <Send className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Enter recipient and amount
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="recipient"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recipient Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <User className="h-4 w-3 text-gray-400" />
                  </div>

                  <input
                    type="email"
                    id="recipient"
                    className="input pl-10"
                    placeholder="email@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>

                {recentContacts.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Recent contacts
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {recentContacts.map((contact) => (
                        <button
                          key={contact.email}
                          type="button"
                          onClick={() => setRecipient(contact.email)}
                          className={`text-xs py-1 px-2 rounded-full flex items-center ${
                            recipient === contact.email
                              ? "bg-primary-100 text-primary-700 border border-primary-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[10px] mr-1">
                            {contact.name.charAt(0)}
                          </span>
                          {contact.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>

                  <input
                    type="text"
                    id="amount"
                    className="input pl-8"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(user?.balance || 0)}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (Optional)
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <MessageSquare className="h-3 w-2 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="description"
                    className="input pl-10"
                    placeholder="What's this for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleContinue}
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
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirm Transfer
                </h2>
                <div className="bg-gray-100 rounded-full p-2">
                  <Send className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Please review the details before confirming
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Recipient</span>
                  <span className="text-sm font-medium text-gray-900">
                    {recipient}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(parseFloat(amount) || 0)}
                  </span>
                </div>
                {description && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Description</span>
                    <span className="text-sm font-medium text-gray-900">
                      {description}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    $0.00
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-700">
                    {formatCurrency(parseFloat(amount) || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-accent-50 border border-accent-100 rounded-lg p-4 mb-6">
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
              {formatCurrency(parseFloat(amount))} has been sent to {recipient}
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
                  setRecipient("");
                  setAmount("");
                  setDescription("");
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
