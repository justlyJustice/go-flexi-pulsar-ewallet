import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Landmark,
  Send,
  User,
  DollarSign,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  FileDigit,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuthStore } from "../stores/authStore";
import { useTransactionStore } from "../stores/transactionStore";
import { formatCurrency } from "../utils/formatters";
import { useBankStore } from "../stores/banksStore";
import { validateAccount } from "../utils/banks";
import { transferFunds } from "../services/transfer";

const Transfer: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuthStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const banks = useBankStore((state) => state.banks);

  const [values, setValues] = useState({
    account_number: "",
    amount: "",
    bank_name: "",
    name_enquiry_reference: "",
    narration: "",
  });

  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [bankCode, setBankCode] = useState("");

  const TRANSFER_FEE = 20;

  const handleValidateAccount = async () => {
    setValues((prevValues) => ({
      ...prevValues,
      name_enquiry_reference: "",
    }));

    try {
      setValidating(true);
      const res = await validateAccount(values.account_number, bankCode);
      setValidating(false);

      if (res.status !== 200) {
        toast.error(res.data.message);
        setError(res.data.message);
      } else {
        const data = res.data.data;
        setValues((prevValues) => ({
          ...prevValues,
          name_enquiry_reference: data.account_name,
        }));
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    if (!bankCode || bankCode === "") return;

    handleValidateAccount();
  }, [bankCode]);

  useEffect(() => {
    if (values.account_number === "") {
      setBankCode("");
      setValues((prev) => ({ ...prev, name_enquiry_reference: "" }));
    }
  }, [values.account_number]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setValues((prevValues) => ({ ...prevValues, [name]: value }));
    }
  };

  const handleContinue = () => {
    const { account_number, amount, bank_name, name_enquiry_reference } =
      values;

    if (!account_number || !amount || !bank_name || !name_enquiry_reference) {
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

    const amountValue = parseFloat(values.amount) + TRANSFER_FEE;

    try {
      setIsLoading(true);
      const res = await transferFunds({
        ...values,
        amount: String(amountValue),
      });
      setIsLoading(false);

      if (!res.ok) {
        setError(res.data?.message || "Transfer failed");
        toast.error(res.data?.message || "Transfer failed");
      } else {
        console.log(res.data);
        // toast.success(res.data?.message!);

        // const expectedBalance = user?.balance! - amountValue;

        // // Update user balance
        // updateBalance(expectedBalance);

        // // Add transaction
        // addTransaction({
        //   amount: amountValue,
        //   type: "transfer-out",
        //   description:
        //     values.narration || `Transfer to ${values.name_enquiry_reference}`,
        //   recipient: values.name_enquiry_reference,
        //   status: "completed",
        // });

        // // Go to success step
        // setStep(3);
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
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transfer Details
                </h2>

                <div className="bg-gray-100 rounded-full p-2">
                  <Send className="h-5 w-5 text-gray-500" />
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Enter recipient account information
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
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
                  htmlFor="account_number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Account Number
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <FileDigit className="h-4 w-3 text-gray-400" />
                  </div>

                  <input
                    type="text"
                    id="account_number"
                    name="account_number"
                    className="input pl-10"
                    // placeholder="email@example.com"
                    value={values.account_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* {recentContacts.length > 0 && (
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
                )} */}
              </div>

              <div>
                <label
                  htmlFor="bank-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bank Name
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <Landmark className="h-4 w-3 text-gray-400" />
                  </div>

                  <select
                    disabled={values.account_number.length <= 5}
                    className="input pl-4"
                    name="bank-select"
                    id="bank-select"
                    value={bankCode}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const { value } = e.target;
                      setBankCode(value);

                      const selectedBank = banks.filter(
                        (bank) => bank.code === value
                      )[0];
                      setValues((prevValues) => ({
                        ...prevValues,
                        bank_name: selectedBank.name,
                      }));
                    }}
                  >
                    <option value="">Select Bank</option>

                    {banks.map((bank, i) => (
                      <option className="ml-2" key={i} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>

                  {/* <input
                    type="email"
                    id="recipient"
                    className="input pl-10"
                    placeholder="email@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  /> */}
                </div>
              </div>

              <div>
                <label
                  htmlFor="name_enquiry_reference"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Account Name
                </label>

                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <User className="h-4 w-3 text-gray-400" />
                  </div>

                  <input
                    disabled
                    type="text"
                    id="name_enquiry_reference"
                    name="name_enquiry_reference"
                    className="input pl-10"
                    value={values.name_enquiry_reference}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* {recentContacts.length > 0 && (
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
                )} */}
              </div>

              <div>
                <label
                  htmlFor="narration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Narration (Optional)
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
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={validating}
                type="button"
                onClick={handleContinue}
                className={`btn btn-primary px-6 ${
                  validating ? "disabled btn-primary-100" : ""
                }`}
              >
                {!validating ? (
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirm Transfer
                </h2>

                <div className="bg-gray-100 rounded-full p-2">
                  <Send className="h-3 w-3 text-gray-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Please review the details before confirming
              </p>
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
