import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight, Loader } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { useAuthStore } from "../../stores/authStore";

interface VirtualCardProps {
  cardType: "naira" | "usd";
  walletBalance?: number;
}

const VirtualCard: React.FC<VirtualCardProps> = ({
  cardType,
  // walletBalance,
}) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const { user } = useAuthStore();

  const createVirtualCard = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCardDetails({
        cardNumber: "4234 5678 9012 3456",
        cvv: "123",
        expiry: "12/25",
        cardName: "John Doe",
      });
      setIsLoading(false);
    }, 1500);
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
              ? "Create a virtual card for online transactions in Naira"
              : "Create a USD virtual card funded from your Naira wallet"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Balance
              </label>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(user?.balance || 0)}
              </div>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount to Fund Card
              </label>

              <input
                type="number"
                id="amount"
                value={amount}
                disabled
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Enter amount in ${cardType.toUpperCase()}`}
              />
            </div>

            <div className="">
              <button
                onClick={createVirtualCard}
                // disabled={isLoading || !amount}
                disabled
                className={`w-full flex items-center justify-center ${
                  isLoading || !amount
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                } text-white py-1 px-4 rounded-lg transition-colors font-medium`}
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Creating Card...
                  </>
                ) : (
                  <>
                    Coming Soon <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {cardDetails && (
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Virtual Card Details
            </h2>
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-80">Card Number</p>
                  <p className="text-xl font-mono tracking-wider mt-1">
                    {cardDetails.cardNumber}
                  </p>
                </div>
                <CreditCard className="h-8 w-8" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-80">Expiry Date</p>
                  <p className="font-medium mt-1">{cardDetails.expiry}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">CVV</p>
                  <p className="font-medium mt-1">{cardDetails.cvv}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm opacity-80">Card Holder</p>
                <p className="font-medium mt-1">{cardDetails.cardName}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>This is a virtual card for online transactions only.</p>
              <p className="mt-1">
                Card balance: {formatCurrency(parseFloat(amount))}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VirtualCard;
