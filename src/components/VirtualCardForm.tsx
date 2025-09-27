import React from "react";
import { formatCurrency } from "../utils/formatters";
import { Loader, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { createVirtualCard } from "../services/virtual-card";

type Props = {
  action: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: any;
  formData: any;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

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
};

const VirtualCardForm = ({ action, user, formData }: Props) => {
  return (
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
                className="w-full p-1 px-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full p-1 px-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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
            {action === "create" ? "Initial Deposit" : "Amount to Fund"}
          </label>

          <input
            disabled
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full p-1 px-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder={`Enter amount in ${cardType.toUpperCase()}`}
            required
            min={cardType === "naira" ? "100" : action === "create" ? "5" : "1"}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            // disabled={isLoading || !formData.amount}
            disabled
            className={`p-1 w-full flex items-center justify-center ${
              isLoading || !formData.amount
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700"
            } text-white px-4 rounded-lg transition-colors font-medium`}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-2 w-2 mr-2" />
                {action === "create" ? "Creating Card..." : "Funding Card..."}
              </>
            ) : (
              <>
                Coming Soon
                {/* {action === "create"
                            ? "Create Virtual Card"
                            : "Fund Card"} */}
                <ArrowRight className="ml-2 h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default VirtualCardForm;
