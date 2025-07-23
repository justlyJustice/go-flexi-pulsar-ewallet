import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bitcoin, ArrowRight, Loader } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const USDTFunding: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  const fundWithUSDT = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTransactionHash("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bitcoin className="h-6 w-6 text-primary-600 mr-3" />
            USDT Funding
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fund your wallet with USDT (ERC20)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-card shadow-card p-6 h-fit">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount in USDT
              </label>

              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter USDT amount"
              />
            </div>

            <div>
              <label
                htmlFor="wallet"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Wallet Address
              </label>

              <input
                type="text"
                id="wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your wallet address"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={fundWithUSDT}
                disabled={isLoading || !amount || !walletAddress}
                className={`w-full flex items-center justify-center ${
                  isLoading || !amount || !walletAddress
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                } text-white py-2 px-4 rounded-lg transition-colors font-medium`}
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin h-3 w-3 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Generate Payment Details{" "}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {transactionHash && (
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Instructions
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Send exactly</p>
                  <p className="text-xl font-bold text-gray-900">
                    {amount} USDT (ERC20)
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">To this address</p>
                  <p className="font-mono text-gray-900 break-all">
                    0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Network</p>
                  <p className="text-gray-900">Ethereum (ERC20)</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ Do not send any other cryptocurrency to this address except
                  USDT. Funds sent in error may be lost permanently.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default USDTFunding;
