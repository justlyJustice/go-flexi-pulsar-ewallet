import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import {
  CheckCircle,
  X,
  Download,
  // Share,
  AlertCircle,
} from "lucide-react";
import html2canvas from "html2canvas";

export type TransactionType = "transfer" | "deposit";

export type TransferTransaction = {
  _id: string;
  amount: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  narration: string;
  name_enquiry_reference: string;
  createdAt: string;
  status?: "successful" | "pending" | "failed";
  fee?: string;
};

export type DepositTransaction = {
  _id: { $oid: string };
  sessionId: string;
  accountNumber: string;
  tranRemarks: string | null;
  transactionAmount: string;
  settledAmount: string;
  feeAmount: string | null;
  vatAmount: string;
  currency: string;
  initiationTranRef: string;
  settlementId: string | null;
  sourceAccountNumber: string;
  sourceAccountName: string;
  sourceBankName: string;
  channelId: string | null;
  tranDateTime: string;
  status?: "successful" | "pending" | "failed";
};

type TransactionDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransferTransaction | DepositTransaction | null;
  type: TransactionType;
};

export const TransactionDetailsModal: React.FC<
  TransactionDetailsModalProps
> = ({ isOpen, onClose, transaction, type }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const formatAmount = (amount: string) => {
    return `₦${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "successful":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case "failed":
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "successful":
        return "Successful";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return "Successful";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "successful":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-green-600";
    }
  };

  const handleDownloadReceipt = async () => {
    if (!transaction) return;

    try {
      setIsDownloading(true);

      const receiptElement = document.createElement("div");
      receiptElement.className =
        "receipt-container bg-white p-6 rounded-lg shadow-lg";
      receiptElement.style.width = "400px";
      receiptElement.style.position = "fixed";
      receiptElement.style.top = "-10000px";
      receiptElement.style.left = "-10000px";
      receiptElement.style.zIndex = "10000";

      const isTransfer = type === "transfer";
      const transferTransaction = transaction as TransferTransaction;
      const depositTransaction = transaction as DepositTransaction;

      receiptElement.innerHTML = `
        <div class="receipt-content">
          <!-- Header -->
          <div class="text-center mb-6 border-b pb-4">

            <h2 class="text-xl font-bold text-gray-900 mb-2">Transaction Receipt</h2>

            <div class="flex items-center justify-center gap-2 ${getStatusColor(
              transaction.status
            )}">
              ${getStatusText(transaction.status)}
            </div>
          </div>

          <div class="mb-6 text-center">
            ${
              isTransfer
                ? `
              <div class="mb-3">
                <p class="text-sm text-gray-600">Transfer to</p>
                <p class="text-lg font-semibold text-gray-900">${transferTransaction.name_enquiry_reference}</p>
              </div>
            `
                : `
              <div class="mb-3">
                <p class="text-sm text-gray-600">Deposit from</p>
                <p class="text-lg font-semibold text-gray-900">${depositTransaction.sourceAccountName}</p>
              </div>
            `
            }
            
            <div class="text-2xl font-bold text-gray-900 text-center my-4">
              ${formatAmount(
                isTransfer
                  ? transferTransaction.amount
                  : depositTransaction.transactionAmount
              )}
            </div>
          </div>

          <!-- Amount Details -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Amount</span>
                <span class="font-medium text-gray-900">
                  ${formatAmount(
                    isTransfer
                      ? transferTransaction.amount
                      : depositTransaction.transactionAmount
                  )}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Fee</span>
                <span class="font-medium text-gray-900">
                  ${
                    isTransfer
                      ? transferTransaction.fee
                        ? formatAmount(transferTransaction.fee)
                        : "₦0.00"
                      : depositTransaction.feeAmount
                      ? formatAmount(depositTransaction.feeAmount)
                      : "₦0.00"
                  }
                </span>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-2">
                <span class="font-semibold text-gray-900">Amount Paid</span>
                <span class="font-semibold text-gray-900">
                  ${formatAmount(
                    isTransfer
                      ? transferTransaction.amount
                      : depositTransaction.settledAmount
                  )}
                </span>
              </div>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="mb-4">
            <h4 class="font-semibold text-gray-900 mb-3">Transaction Details</h4>
            <div class="space-y-2 text-sm">
              ${
                isTransfer
                  ? `
                <div class="flex justify-between">
                  <span class="text-gray-600">Recipient Details</span>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">${transferTransaction.name_enquiry_reference}</p>
                    <p class="text-gray-500">${transferTransaction.bank_name} • ${transferTransaction.account_number}</p>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Narration</span>
                  <span class="font-medium text-gray-900">${transferTransaction.narration}</span>
                </div>
              `
                  : `
                <div class="flex justify-between">
                  <span class="text-gray-600">Source Account</span>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">${
                      depositTransaction.sourceAccountName
                    }</p>
                    <p class="text-gray-500">${
                      depositTransaction.sourceBankName
                    } • ${depositTransaction.sourceAccountNumber}</p>
                  </div>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Remarks</span>
                  <span class="font-medium text-gray-900">${
                    depositTransaction.tranRemarks || "N/A"
                  }</span>
                </div>
              `
              }

              <div class="flex justify-between">
                <span class="text-gray-600">Transaction No.</span>
                <span class="font-medium text-gray-900">
                  ${
                    isTransfer
                      ? transferTransaction._id
                      : depositTransaction.initiationTranRef
                  }
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Payment Method</span>
                <span class="font-medium text-gray-900">${
                  isTransfer ? "Bank Transfer" : "Bank Deposit"
                }</span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-600">Transaction Date</span>
                <span class="font-medium text-gray-900">
                  ${formatDate(
                    isTransfer
                      ? transferTransaction.createdAt
                      : depositTransaction.tranDateTime
                  )}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center text-xs text-gray-500 border-t pt-4">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Thank you for using our service</p>
          </div>
        </div>
      `;

      // Add to document
      document.body.appendChild(receiptElement);

      // Wait for the element to be rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = await html2canvas(receiptElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Convert to image and download
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `receipt-${isTransfer ? "transfer" : "deposit"}-${
        transaction._id
      }.png`;
      link.href = image;
      link.click();

      setIsDownloading(false);

      // Clean up
      document.body.removeChild(receiptElement);
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  // const handleShareReceipt = () => {
  //   // Implement share receipt logic
  //   console.log("Share receipt for:", transaction);
  // };

  // const handleReportIssue = () => {
  //   // Implement report issue logic
  //   console.log("Report issue for:", transaction);
  // };

  const isTransfer = type === "transfer";
  const transferTransaction = transaction as TransferTransaction;
  const depositTransaction = transaction as DepositTransaction;

  const status = transaction?.status || "successful";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        open={isOpen}
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90" />
        </TransitionChild>

        {transaction && (
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  <div className="bg-gray-50 px-2 py-1 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-lg font-semibold text-gray-900">
                        Transaction Details
                      </DialogTitle>

                      <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-200 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <div className="text-center mb-2">
                      {isTransfer ? (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">Transfer to</p>

                          <p className="text-lg font-semibold text-gray-900">
                            {transferTransaction.name_enquiry_reference}
                          </p>
                        </div>
                      ) : (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">Deposit from</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {depositTransaction.sourceAccountName}
                          </p>
                        </div>
                      )}

                      <div className="text-2xl font-bold text-gray-900 my-3">
                        {formatAmount(
                          isTransfer
                            ? transferTransaction.amount
                            : depositTransaction.transactionAmount
                        )}
                      </div>

                      <div
                        className={`flex items-center justify-center gap-2 ${getStatusColor(
                          status
                        )}`}
                      >
                        {getStatusIcon(status)}

                        <span className="font-semibold">
                          {getStatusText(status)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount</span>
                          <span className="font-medium text-gray-900">
                            {formatAmount(
                              isTransfer
                                ? transferTransaction.amount
                                : depositTransaction.transactionAmount
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fee</span>
                          <span className="font-medium text-gray-900">
                            {isTransfer
                              ? transferTransaction.fee
                                ? formatAmount(transferTransaction.fee)
                                : "₦0.00"
                              : depositTransaction.feeAmount
                              ? formatAmount(depositTransaction.feeAmount)
                              : "₦0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="font-semibold text-gray-900">
                            Amount Paid
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatAmount(
                              isTransfer
                                ? transferTransaction.amount
                                : depositTransaction.settledAmount
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Transaction Details
                      </h4>

                      <div className="space-y-2 text-sm">
                        {isTransfer ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Recipient Details
                              </span>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {transferTransaction.name_enquiry_reference}
                                </p>
                                <p className="text-gray-500">
                                  {transferTransaction.bank_name} •{" "}
                                  {transferTransaction.account_number}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Narration</span>
                              <span className="font-medium text-gray-900">
                                {transferTransaction.narration}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Source Account
                              </span>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {depositTransaction.sourceAccountName}
                                </p>
                                <p className="text-gray-500">
                                  {depositTransaction.sourceBankName} •{" "}
                                  {depositTransaction.sourceAccountNumber}
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remarks</span>
                              <span className="font-medium text-gray-900">
                                {depositTransaction.tranRemarks || "N/A"}
                              </span>
                            </div>
                          </>
                        )}

                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction No.</span>
                          <span className="font-medium text-gray-900">
                            {isTransfer
                              ? transferTransaction._id
                              : depositTransaction.initiationTranRef}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="font-medium text-gray-900">
                            {isTransfer ? "Bank Transfer" : "Bank Deposit"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Transaction Date
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatDate(
                              isTransfer
                                ? transferTransaction.createdAt
                                : depositTransaction.tranDateTime
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-end">
                      {/* <button
                        onClick={handleReportIssue}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Report Issue
                      </button> */}

                      <button
                        disabled={isDownloading}
                        onClick={handleDownloadReceipt}
                        className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        {isDownloading ? (
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
                            <span>Downloading</span>
                          </span>
                        ) : (
                          <>
                            <Download className="h-3 w-3" />
                            Download Receipt
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        )}
      </Dialog>
    </Transition>
  );
};
