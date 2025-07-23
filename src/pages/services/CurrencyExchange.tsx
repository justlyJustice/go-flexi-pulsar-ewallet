import React, { useState } from "react";
import { motion } from "framer-motion";
import { Repeat, ArrowRight, Loader } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const CurrencyExchange: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const currencies = [
    { code: "NGN", name: "Naira" },
    { code: "USD", name: "US Dollar" },
    { code: "GBP", name: "British Pound" },
    { code: "EUR", name: "Euro" },
  ];

  const getExchangeRate = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock exchange rates
      const rates: Record<string, number> = {
        "NGN-USD": 0.0022,
        "USD-NGN": 750,
        "NGN-GBP": 0.0018,
        "GBP-NGN": 850,
        "NGN-EUR": 0.0021,
        "EUR-NGN": 820,
      };

      const rateKey = `${fromCurrency}-${toCurrency}`;
      setExchangeRate(rates[rateKey] || 0);
      setIsLoading(false);
    }, 1000);
  };

  const calculateConvertedAmount = () => {
    if (!amount || !exchangeRate) return 0;
    return parseFloat(amount) * exchangeRate;
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
            <Repeat className="h-6 w-6 text-primary-600 mr-3" />
            Currency Exchange
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Convert between different currencies at competitive rates
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="from-currency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From
              </label>

              <select
                id="from-currency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                {currencies.map((currency) => (
                  <option key={`from-${currency.code}`} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="to-currency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To
              </label>
              <select
                id="to-currency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                {currencies.map((currency) => (
                  <option key={`to-${currency.code}`} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={getExchangeRate}
              disabled={isLoading || !amount}
              className={`flex items-center ${
                isLoading || !amount
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              } text-white py-2 px-6 rounded-lg transition-colors font-medium`}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-3 w-3 mr-2" />
                  Getting Rate...
                </>
              ) : (
                "Get Exchange Rate"
              )}
            </button>
          </div>

          {exchangeRate > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Exchange Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  1 {fromCurrency} = {exchangeRate} {toCurrency}
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">You will receive</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {formatCurrency(calculateConvertedAmount(), toCurrency)}
                </p>
              </div>

              <div className="mt-6">
                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  Confirm Exchange
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CurrencyExchange;
