import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight, Loader, Plus, DollarSign } from "lucide-react";

import { formatCurrency } from "../../utils/formatters";
import { useAuthStore } from "../../stores/authStore";

import { createVirtualCard } from "../../services/cards";

interface VirtualCardProps {
  cardType: "naira" | "usd";
}

const VirtualCard: React.FC<VirtualCardProps> = ({ cardType }) => {
  const [formData, setFormData] = useState({
    name_on_card: "",
    card_type: "",
    amount: "",
    customerEmail: "",
  });
  const [action, setAction] = useState<"create" | "fund">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { user } = useAuthStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const res = await createVirtualCard("usd", {
        amount: formData.amount,
        card_type: "visa",
        customerEmail: formData.customerEmail,
        name_on_card: formData.name_on_card,
      });
      setIsLoading(false);

      console.log(res);
    } catch (error) {}

    // Simulate API call
    // setTimeout(() => {
    //   setCardDetails({
    //     cardNumber:
    //       "4" +
    //       Math.floor(1000 + Math.random() * 9000) +
    //       " " +
    //       Math.floor(1000 + Math.random() * 9000) +
    //       " " +
    //       Math.floor(1000 + Math.random() * 9000) +
    //       " " +
    //       Math.floor(1000 + Math.random() * 9000),
    //     cvv: Math.floor(100 + Math.random() * 900).toString(),
    //     expiry: `${Math.floor(Math.random() * 12 + 1)
    //       .toString()
    //       .padStart(2, "0")}/${Math.floor(Math.random() * 5 + 24)}`,
    //     cardName: formData.name_on_card,
    //     balance: parseFloat(formData.amount) || 0,
    //   });
    //   setIsLoading(false);
    // }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
            {cardType === "naira" ? "Naira Virtual Card" : "USD Virtual Card"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {cardType === "naira"
              ? "Create and fund a virtual card for online transactions in Naira"
              : "Create and fund a USD virtual card"}
          </p>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setAction("create")}
          className={`px-4 py-1 rounded-lg font-medium text-sm ${
            action === "create"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center">
            <Plus className="h-3 w-3 mr-2" />
            Create New Card
          </div>
        </button>
        <button
          onClick={() => setAction("fund")}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            action === "fund"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Fund Existing Card
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-card p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Balance
                </label>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(user?.balance || 0)}
                </div>
              </div>

              {action === "create" && (
                <>
                  <div>
                    <label
                      htmlFor="name_on_card"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="name_on_card"
                      name="name_on_card"
                      value={formData.name_on_card}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter name as it will appear on card"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerEmail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="customerEmail"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Your email address"
                      required
                    />
                  </div>
                </>
              )}

              {action === "fund" && cardDetails && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg font-mono">
                    {cardDetails.cardNumber}
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {action === "create" ? "Initial Deposit" : "Amount to Fund"}
                </label>

                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder={`Enter amount in ${cardType.toUpperCase()}`}
                  required
                  // min="100"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !formData.amount}
                  className={`p-2 w-full flex items-center justify-center ${
                    isLoading || !formData.amount
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  } text-white px-4 rounded-lg transition-colors font-medium`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      {action === "create"
                        ? "Creating Card..."
                        : "Funding Card..."}
                    </>
                  ) : (
                    <>
                      {action === "create"
                        ? "Create Virtual Card"
                        : "Fund Card"}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {cardDetails ? (
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {action === "create"
                ? "Your New Virtual Card"
                : "Your Virtual Card"}
            </h2>

            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Card Number</p>
                  <p className="text-xl font-mono tracking-wider mt-1">
                    {cardDetails.cardNumber}
                  </p>
                </div>

                <CreditCard className="h-8 w-8" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Expiry Date</p>
                  <p className="font-medium mt-1">{cardDetails.expiry}</p>
                </div>

                <div>
                  <p className="text-sm opacity-80">CVV</p>
                  <p className="font-medium mt-1">{cardDetails.cvv}</p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm opacity-80">Card Holder</p>
                <p className="font-medium mt-1">{cardDetails.cardName}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Card Type:</span>
                <span className="text-sm font-medium text-gray-900">
                  {cardType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Card Balance:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(cardDetails.balance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-card p-6 flex items-center justify-center">
            <div className="text-center">
              <CreditCard className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {action === "create"
                  ? "No card created yet"
                  : "No card to fund"}
              </h3>
              <p className="text-sm text-gray-500">
                {action === "create"
                  ? "Fill the form to create your virtual card"
                  : "You need to create a card first before funding"}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VirtualCard;
