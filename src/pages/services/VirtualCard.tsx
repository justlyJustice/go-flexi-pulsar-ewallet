import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight, Loader, Plus, DollarSign } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { useAuthStore } from "../../stores/authStore";
import {
  createVirtualCard,
  fundVirtualCard,
  getVirtualCardDetails,
} from "../../services/cards";
import toast from "react-hot-toast";

interface VirtualCardProps {
  cardType: "naira" | "usd";
}

const VirtualCard: React.FC<VirtualCardProps> = ({ cardType }) => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name_on_card: user?.fullName || "",
    card_type: cardType,
    amount: "5",
    customerEmail: user?.email || "",
  });
  // const [createdType, setCreatedType] = useState<"new" | "">("");
  const [action, setAction] = useState<"create" | "fund">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCardDetails, setLoadingCardDetails] = useState(true);
  const [cardDetails, setCardDetails] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getCardDetails = async () => {
    try {
      setLoadingCardDetails(true);
      const res = await getVirtualCardDetails();

      if (res.ok && res.data) {
        const data = res.data?.data?.response?.card_detail;

        setCardDetails(data);
      } else {
        toast.error(res.data!.error);
        setCardDetails(null);
      }
    } catch (error) {
      console.error("Error fetching card details:", error);
      toast.error("Something went wrong. Please reload this page.", {
        removeDelay: 10000,
      });
      setCardDetails(null);
    } finally {
      setLoadingCardDetails(false);
    }
  };

  useEffect(() => {
    // Check if we should fetch card details on initial load
    if (cardType === "usd" && user?.vusd_card && user?.vusd_card !== "") {
      getCardDetails();
    } else {
      setLoadingCardDetails(false);
    }
  }, [user?.vusd_card, cardType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (action === "fund") {
      try {
        const res = await fundVirtualCard(cardType, {
          amount: formData.amount,
        });

        if (!res.ok) {
          console.log(res);
        }

        console.log(res);
      } catch (error) {
        console.error("Error funding virtual card:", error);
      }
    } else {
      try {
        setIsLoading(true);
        const res = await createVirtualCard(cardType, {
          amount: formData.amount,
          card_type: "visa",
          customerEmail: formData.customerEmail,
          name_on_card: formData.name_on_card,
        });

        if (res.ok && res.data) {
          // Update user with new card info

          updateUser({ vusd_card: res.data?.data?.vusd_card });
          // Fetch the newly created card details
          toast.success("Created Successfully!");

          setTimeout(() => {
            window.location.reload();
          }, 1000);
          // await getCardDetails();
          // Switch to fund mode
          // setAction("fund");
        } else {
          toast.error(res?.data!.error);
        }
      } catch (error) {
        console.error("Error creating virtual card:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Set initial action based on whether card exists
  // useEffect(() => {
  //   if (cardType === "usd" && user?.vusd_card && user?.vusd_card !== "") {
  //     setAction("fund");
  //   } else {
  //     setAction("create");
  //   }
  // }, [user?.vusd_card, cardType]);

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

      {loadingCardDetails && user?.vusd_card && user?.vusd_card !== "" ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">
              Loading your virtual card details...
            </p>
          </div>
        </div>
      ) : (
        <>
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
                          disabled
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
                          disabled
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
                        {cardDetails.card_number}
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      {action === "create"
                        ? "Initial Deposit"
                        : "Amount to Fund"}
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
                      min={
                        cardType === "naira"
                          ? "100"
                          : action === "create"
                          ? "5"
                          : "1"
                      }
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

            {loadingCardDetails ? (
              <div className="bg-white rounded-card shadow-card p-6 flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading card details...</p>
                </div>
              </div>
            ) : cardDetails ? (
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
                        {cardDetails.card_number.replace(
                          /(\d{4})(?=\d)/g,
                          "$1 "
                        )}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-8 w-8" />
                      <span className="ml-2 text-sm font-medium">
                        {cardDetails.card_brand}
                      </span>
                    </div>
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
                    <p className="font-medium mt-1">
                      {cardDetails.card_holder_name}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Card Type:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {cardDetails.card_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Card Balance:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        cardDetails.balance,
                        cardType === "usd" ? "USD" : "NGN"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize 
        ${cardDetails.card_status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'}"
                    >
                      {cardDetails.card_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(cardDetails.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Billing Information Section */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Billing Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Country:</span>
                        <p className="text-sm font-medium">
                          {cardDetails.billing_country}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">City:</span>
                        <p className="text-sm font-medium">
                          {cardDetails.billing_city}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-gray-500">Address:</span>
                        <p className="text-sm font-medium">
                          {cardDetails.billing_street}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">ZIP Code:</span>
                        <p className="text-sm font-medium">
                          {cardDetails.billing_zip_code}
                        </p>
                      </div>
                    </div>
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
        </>
      )}
    </motion.div>
  );
};

export default VirtualCard;
