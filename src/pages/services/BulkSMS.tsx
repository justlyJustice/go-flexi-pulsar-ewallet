import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ArrowRight, Loader } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const BulkSMS: React.FC = () => {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [senderId, setSenderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [costEstimate, setCostEstimate] = useState(0);

  const calculateCost = () => {
    // Simple cost calculation - 1 unit per 160 characters, 1 unit per recipient
    const messageUnits = Math.ceil(message.length / 160);
    const recipientCount = recipients.split(",").filter((r) => r.trim()).length;
    return messageUnits * recipientCount;
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCostEstimate(calculateCost());
    }, 1000);
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
            <MessageSquare className="h-6 w-6 text-primary-600 mr-3" />
            Bulk SMS
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Send messages to multiple recipients at once
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="sender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sender ID (Max 11 chars)
            </label>
            <input
              type="text"
              id="sender"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value.slice(0, 11))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Your company name"
              maxLength={11}
            />
          </div>

          <div>
            <label
              htmlFor="recipients"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Recipients (comma separated phone numbers)
            </label>
            <textarea
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
              placeholder="08012345678, 09098765432, ..."
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              // rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 h-32"
              placeholder="Type your message here..."
              maxLength={459} // 3 SMS concatenated (153 * 3)
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/459 characters (Max 3 SMS)
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estimated Cost</p>
              <p className="text-xl font-bold text-gray-900">
                {costEstimate > 0 ? formatCurrency(costEstimate) : "---"}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !message || !recipients}
              className={`flex items-center ${
                isLoading || !message || !recipients
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              } text-white py-2 px-6 rounded-lg transition-colors font-medium`}
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-3 w-3 mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  Calculate Cost <ArrowRight className="ml-2 h-3 w-3" />
                </>
              )}
            </button>
          </div>

          {costEstimate > 0 && (
            <div className="pt-4">
              <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Send {recipients.split(",").filter((r) => r.trim()).length} SMS
                for {formatCurrency(costEstimate)}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BulkSMS;
