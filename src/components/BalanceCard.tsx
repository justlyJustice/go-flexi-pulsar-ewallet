import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Wallet,
  TrendingUp,
  Copy,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

const BalanceCard: React.FC<{
  showBalance: boolean;
  displayBalance: string;
  toggleBalanceVisibility: () => void;
}> = ({ showBalance, displayBalance, toggleBalanceVisibility }) => {
  const { user } = useAuthStore();
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleCurrency = () => {
    setShowCurrencyDropdown(!showCurrencyDropdown);
  };

  const selectCurrency = (selectedCurrency: "NGN" | "USD") => {
    setCurrency(selectedCurrency);
    setShowCurrencyDropdown(false);
  };

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-card shadow-card p-6 text-white h-fit">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Wallet className="h-8 w-8" />
          <h2 className="ml-2 text-xl font-semibold">Your Balance</h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={toggleCurrency}
              className="flex items-center px-2 py-1 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition"
              aria-label="Change currency"
            >
              <span className="text-sm mr-1">{currency}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => selectCurrency("NGN")}
                    className={`block w-full text-left px-3 py-1 text-sm ${
                      currency === "NGN"
                        ? "bg-primary-100 text-primary-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    NGN
                  </button>
                  <button
                    onClick={() => selectCurrency("USD")}
                    className={`block w-full text-left px-3 py-1 text-sm ${
                      currency === "USD"
                        ? "bg-primary-100 text-primary-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Balance Toggle Button */}
          <button
            onClick={toggleBalanceVisibility}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition"
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? (
              <EyeOff className="h-2 w-2" />
            ) : (
              <Eye className="h-2 w-2" />
            )}
          </button>

          <div className="p-2 bg-white bg-opacity-20 rounded-full">
            <TrendingUp className="h-2 w-2" />
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-3">
        <div className="space-y-1">
          <p className="text-sm text-white text-opacity-80">
            Available Balance
          </p>
          <p className="text-3xl font-bold">
            {currency === "NGN" ? displayBalance : `$ ${(0).toFixed(2)}`}
          </p>
        </div>

        {user?.tier === "merchant" && (
          <div className="space-y-1">
            <p className="text-sm text-white text-opacity-80">
              Merchant Verification Code
            </p>

            <div className=" bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition w-fit px-2">
              <p className="text-2xl font-bold">
                {user?.merchantVerificationCode}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 bg-white bg-opacity-10 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">
          {currency === "NGN" ? "Naira Account Details" : "USD Wallet Details"}
        </h3>

        {currency === "NGN" ? (
          <div className="space-y-1">
            <div>
              <p className="text-xs text-white text-opacity-70">Bank Name</p>
              <p className="font-medium">
                {user?.bankInformation?.bankName || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-white text-opacity-70">Account Name</p>
              <p className="font-medium">
                {user?.bankInformation?.accountName || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-white text-opacity-70">
                Account Number
              </p>
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {user?.bankInformation?.accountNumber || "Not provided"}
                </p>
                {user?.bankInformation?.accountNumber && (
                  <button
                    onClick={() =>
                      copyToClipboard(user.bankInformation.accountNumber)
                    }
                    className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition"
                    aria-label="Copy account number"
                  >
                    <Copy className="h-2 w-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div>
              <p className="text-xs text-white text-opacity-70">
                USD Wallet Address
              </p>
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">
                  {/* {"0xf730107CBB97211D3C2276F13f4b893140023597" ||
                    "Not provided"} */}
                  0xf730107CBB97211D3C2276F13f4b893140023597
                </p>
                {/* {"0xf730107CBB97211D3C2276F13f4b893140023597" && (
                 
                )} */}

                <button
                  onClick={() =>
                    copyToClipboard(
                      `0xf730107CBB97211D3C2276F13f4b893140023597`
                    )
                  }
                  className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition"
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-2 w-2" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-white text-opacity-70">Network</p>
              <p className="font-medium">USDT (TRC20)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;
