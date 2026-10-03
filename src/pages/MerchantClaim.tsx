import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  UploadCloud,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Send,
  Mail,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "../stores/authStore";

import { Claim, ClaimStatus } from "../types/claim";
import { createClaim, getClaim, submitClaim } from "../services/claim";
import { confirmWithdrawal, requestWithdrawal } from "../services/withdrawal";
import { banks } from "../banksList";

// ================= TYPES =================
export type DocumentSlot = {
  id: string;
  fieldName: string;
  name: string;
  required: boolean;
  description: string;
  file: File | null;
  uploaded: boolean;
  status: "pending" | "uploading" | "uploaded" | "error";
};

type ClaimDetails = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  withdrawalAmount: string;
};

type WithdrawalDetails = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  amountUSD: string;
};

// ================= CONSTANTS =================
const createClaimDocuments = (): DocumentSlot[] => [
  {
    id: "bank-statement",
    fieldName: "bankStatement",
    name: "Recent Bank Statement",
    required: true,
    description: "Last 3 months bank statement",
    file: null,
    uploaded: false,
    status: "pending",
  },
  {
    id: "government-id",
    fieldName: "governmentId",
    name: "Government-Issued ID",
    required: true,
    description: "National ID, Driver's License, or Passport",
    file: null,
    uploaded: false,
    status: "pending",
  },
  {
    id: "proof-of-address",
    fieldName: "proofOfAddress",
    name: "Proof of Address",
    required: true,
    description: "Utility bill or tenancy agreement (recent)",
    file: null,
    uploaded: false,
    status: "pending",
  },
  {
    id: "signed-claim-form",
    fieldName: "signedClaimForm",
    name: "Signed Claim Form",
    required: true,
    description: "Completed and signed claim request form",
    file: null,
    uploaded: false,
    status: "pending",
  },
];

const MIN_WITHDRAWAL_USD = 2;
const MAX_WITHDRAWAL_USD = 1000;
const USD_TO_NGN_RATE = 1354;

// ================= SUBMIT CLAIM MODAL =================
type SubmitClaimModalProps = {
  show: boolean;
  claim: Claim | null;
  documents: DocumentSlot[];
  claimDetails: ClaimDetails;
  setClaimDetails: React.Dispatch<React.SetStateAction<ClaimDetails>>;
  submitting: boolean;
  formError: string;
  onClose: () => void;
  onFileChange: (documentId: string, file: File | null) => void;
  onRemoveFile: (documentId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const SubmitClaimModal = ({
  show,
  claim,
  documents,
  claimDetails,
  setClaimDetails,
  submitting,
  formError,
  onClose,
  onFileChange,
  onRemoveFile,
  onSubmit,
}: SubmitClaimModalProps) => {
  if (!show) return null;

  const allRequiredUploaded = documents
    .filter((d) => d.required)
    .every((d) => d.uploaded);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Send className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Submit Claim
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                {claim?.claimNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-6">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {formError}
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Required Documents
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              All documents are required to process your claim.
            </p>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`border rounded-lg p-3 transition-all ${
                    doc.uploaded
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <h5 className="text-sm font-medium text-gray-900">
                          {doc.name}
                          {doc.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h5>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {doc.description}
                      </p>
                      {doc.file && (
                        <p className="mt-1 text-xs text-gray-400">
                          {doc.file.name} ({(doc.file.size / 1024).toFixed(2)}{" "}
                          KB)
                        </p>
                      )}
                    </div>

                    {doc.uploaded && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <label
                      htmlFor={`claim-doc-${doc.id}`}
                      className={`btn-outline text-xs px-3 py-1.5 flex items-center cursor-pointer ${
                        doc.uploaded ? "opacity-50" : ""
                      }`}
                    >
                      <UploadCloud className="h-3 w-3 mr-1" />
                      {doc.uploaded ? "Replace" : "Upload"}
                      <input
                        id={`claim-doc-${doc.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                          onFileChange(doc.id, e.target.files?.[0] || null)
                        }
                      />
                    </label>

                    {doc.uploaded && (
                      <button
                        type="button"
                        onClick={() => onRemoveFile(doc.id)}
                        className="text-red-600 text-xs font-medium flex items-center"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Withdrawal Account Details
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Where should we send the funds once approved?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={claimDetails.accountName}
                  onChange={(e) =>
                    setClaimDetails((prev) => ({
                      ...prev,
                      accountName: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                  className="input-field w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={claimDetails.accountNumber}
                  onChange={(e) =>
                    setClaimDetails((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }))
                  }
                  placeholder="0123456789"
                  className="input-field w-full text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={claimDetails.bankName}
                  onChange={(e) =>
                    setClaimDetails((prev) => ({
                      ...prev,
                      bankName: e.target.value,
                    }))
                  }
                  placeholder="Access Bank"
                  className="input-field w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Withdrawal Amount (USD){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    value={claimDetails.withdrawalAmount}
                    onChange={(e) =>
                      setClaimDetails((prev) => ({
                        ...prev,
                        withdrawalAmount: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    min={MIN_WITHDRAWAL_USD}
                    max={MAX_WITHDRAWAL_USD}
                    step="0.01"
                    className="input-field w-full text-sm pl-6"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Min: ${MIN_WITHDRAWAL_USD} | Max: ${MAX_WITHDRAWAL_USD}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Mail className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Once you submit, an admin will review your claim. You'll receive
              an email notification when a decision is made. If approved, a
              withdrawal authorization code will be issued.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-outline px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !allRequiredUploaded}
              className={`btn-primary px-4 py-2 flex items-center gap-2 ${
                submitting || !allRequiredUploaded
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================= WITHDRAWAL MODAL =================
type WithdrawModalProps = {
  show: boolean;
  claim: Claim | null;
  withdrawalDetails: WithdrawalDetails;
  setWithdrawalDetails: React.Dispatch<React.SetStateAction<WithdrawalDetails>>;
  withdrawing: boolean;
  withdrawError: string;
  verifying: boolean;
  verified: boolean;
  onClose: () => void;
  onBankSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAccountNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
};

const WithdrawModal = ({
  show,
  claim,
  withdrawalDetails,
  setWithdrawalDetails,
  withdrawing,
  withdrawError,
  verifying,
  verified,
  onClose,
  onBankSelect,
  onAccountNumberChange,
  onSubmit,
}: WithdrawModalProps) => {
  if (!show) return null;

  const amountUSD = parseFloat(withdrawalDetails.amountUSD) || 0;
  const amountNGN = amountUSD * USD_TO_NGN_RATE;
  const isValidAmount =
    amountUSD >= MIN_WITHDRAWAL_USD && amountUSD <= MAX_WITHDRAWAL_USD;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Request Withdrawal
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                {claim?.claimNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={withdrawing}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-6">
          {withdrawError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {withdrawError}
            </div>
          )}

          {/* Amount */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Withdrawal Amount
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Enter the amount in USD. The Naira equivalent is shown below.
            </p>

            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                value={withdrawalDetails.amountUSD}
                onChange={(e) =>
                  setWithdrawalDetails((prev) => ({
                    ...prev,
                    amountUSD: e.target.value,
                  }))
                }
                placeholder="0.00"
                min={MIN_WITHDRAWAL_USD}
                max={MAX_WITHDRAWAL_USD}
                step="0.01"
                className="input-field w-full text-sm pl-6"
              />
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Min: ${MIN_WITHDRAWAL_USD} | Max: ${MAX_WITHDRAWAL_USD}
            </p>

            {withdrawalDetails.amountUSD && (
              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                Naira Equivalent:{" "}
                <span className="font-semibold">
                  ₦
                  {amountNGN.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>{" "}
                (at ≈ ₦{USD_TO_NGN_RATE.toLocaleString()}/$)
              </div>
            )}
          </div>

          {/* Account details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Account Details
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Select your bank and enter your account number.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Bank Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bank <span className="text-red-500">*</span>
                </label>
                <select
                  value={withdrawalDetails.bankName}
                  onChange={onBankSelect}
                  className="input-field w-full text-sm"
                  disabled={verifying}
                >
                  <option value="">Select your bank</option>
                  {banks.map((bank) => (
                    <option key={bank.bankCode} value={bank.bankName}>
                      {bank.bankName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>

                <div className="flex items-stretch">
                  <input
                    type="text"
                    value={withdrawalDetails.accountNumber}
                    onChange={onAccountNumberChange}
                    placeholder="0123456789"
                    maxLength={10}
                    inputMode="numeric"
                    className="input-field flex-1 text-sm font-mono"
                    disabled={verifying}
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Account number must be 10 digits
                </p>
              </div>

              {/* Account Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={withdrawalDetails.accountName}
                  onChange={(e) =>
                    setWithdrawalDetails((prev) => ({
                      ...prev,
                      accountName: e.target.value,
                    }))
                  }
                  placeholder="Account Name"
                  className={`input-field w-full text-sm ${
                    verified
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-gray-50"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={withdrawing}
              className="btn-outline px-3 py-1 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={withdrawing || !isValidAmount}
              className={`btn-primary px-3 py-1 flex items-center gap-2 ${
                withdrawing || !isValidAmount
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {withdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-2 w-2" />
                  Request Withdrawal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================= MAIN COMPONENT =================
const MerchantClaim = () => {
  const { user } = useAuthStore();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [documents, setDocuments] = useState<DocumentSlot[]>(
    createClaimDocuments(),
  );
  const [claimDetails, setClaimDetails] = useState<ClaimDetails>({
    accountName: "",
    accountNumber: "",
    bankName: "",
    withdrawalAmount: "",
  });
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails>(
    {
      accountName: "",
      accountNumber: "",
      bankName: "",
      amountUSD: "",
    },
  );
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [formError, setFormError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  // ---- Account verification state for the withdrawal modal ----
  const [verifying] = useState(false);
  const [verified] = useState(false);

  const fetchClaim = async () => {
    setLoading(true);
    try {
      const res = await getClaim();

      if (!res.ok) {
        if (res.status === 404) {
          return toast("No claim available.");
        }

        return toast.error(res.data?.error!);
      }

      setClaim(res?.data?.data! ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.claimEnabled && user.isOnApprovedList) {
      fetchClaim();
    }
  }, [user]);

  const handleCreateClaim = async () => {
    if (!user?.claimEnabled && !user?.isOnApprovedList) {
      return toast("Your account is not eligible to create a claim yet.");
    }

    try {
      setCreating(true);

      const res = await createClaim();

      if (!res.ok) {
        return toast.error(res.data?.error!);
      }

      if (res.ok) {
        setClaim(res.data?.data!);
        toast.success("Claim created successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create claim");
    } finally {
      setCreating(false);
    }
  };

  // ================= SUBMIT MODAL =================
  const openSubmitModal = () => {
    // setDocuments(createClaimDocuments());
    // setClaimDetails({
    //   accountName: "",
    //   accountNumber: "",
    //   bankName: "",
    //   withdrawalAmount: "",
    // });
    // setFormError("");
    // setShowSubmitModal(true);
  };

  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setDocuments(createClaimDocuments());
    setFormError("");
  };

  const handleFileChange = (documentId: string, file: File | null) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload PDF, JPG, or PNG files only");
      return;
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, file, status: "uploading" } : doc,
      ),
    );

    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? { ...doc, file, uploaded: true, status: "uploaded" }
            : doc,
        ),
      );
    }, 600);
  };

  const handleRemoveFile = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, file: null, uploaded: false, status: "pending" }
          : doc,
      ),
    );
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim) return;

    try {
      setSubmitting(true);
      setFormError("");

      const res = await submitClaim(claim._id, claim.claimNumber);

      if (!res.ok) {
        return toast.error(res.data?.error || "Failed to submit claim");
      }

      toast.success("Claim submitted successfully!");
      setClaim((prev) => (prev ? { ...prev, status: "pending" } : prev));
      closeSubmitModal();
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= WITHDRAWAL MODAL =================
  const openWithdrawModal = () => {
    setWithdrawalDetails({
      accountName: "",
      accountNumber: "",
      bankName: "",
      amountUSD: "",
    });
    setWithdrawError("");
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => {
    setShowWithdrawModal(false);
    setWithdrawalDetails({
      accountName: "",
      accountNumber: "",
      bankName: "",
      amountUSD: "",
    });
    setWithdrawError("");
  };

  // ---- Bank selection handler ----
  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBankName = e.target.value;

    setWithdrawalDetails((prev) => ({
      ...prev,
      bankName: selectedBankName,
      accountName: "",
    }));
  };

  // ---- Account number change handler ----
  const handleAccountNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setWithdrawalDetails((prev) => ({
      ...prev,
      accountNumber: value,
      accountName: "",
    }));
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim) return;

    const amountUSD = parseFloat(withdrawalDetails.amountUSD);

    if (!amountUSD || isNaN(amountUSD)) {
      setWithdrawError("Please enter a valid withdrawal amount");
      return;
    }

    if (amountUSD < MIN_WITHDRAWAL_USD) {
      setWithdrawError(`Minimum withdrawal is $${MIN_WITHDRAWAL_USD}`);
      return;
    }

    if (amountUSD > MAX_WITHDRAWAL_USD) {
      setWithdrawError(`Maximum withdrawal is $${MAX_WITHDRAWAL_USD}`);
      return;
    }

    if (!withdrawalDetails.bankName) {
      setWithdrawError("Please select a bank");
      return;
    }
    if (withdrawalDetails.accountNumber.length !== 10) {
      setWithdrawError("Account number must be 10 digits");
      return;
    }
    if (!withdrawalDetails.accountName) {
      setWithdrawError("Please enter the account name");
      return;
    }

    try {
      setWithdrawing(true);
      setWithdrawError("");

      const res = await requestWithdrawal({
        claimId: claim._id,
        accountDetails: {
          accountName: withdrawalDetails.accountName,
          accountNumber: withdrawalDetails.accountNumber,
          bankName: withdrawalDetails.bankName,
        },
        amount: String(amountUSD),
      });

      if (!res.ok) {
        return toast.error(res.data?.error || "Failed to request withdrawal");
      }

      const confirmClaimRes = await confirmWithdrawal(
        res.data?.data?.withdrawalId!,
        res.data?.data?.authCode!,
      );

      if (!confirmClaimRes.ok) {
        return toast.error(
          confirmClaimRes.data?.error || "Failed to confirm withdrawal",
        );
      }

      toast.success("Withdrawal request submitted successfully!");
      closeWithdrawModal();
    } catch (error) {
      console.log(error);
      toast.error("Failed to request withdrawal");
    } finally {
      setWithdrawing(false);
    }
  };

  // ================= STATUS META =================
  const statusMeta: Record<
    ClaimStatus,
    { label: string; classes: string; icon: React.ReactNode }
  > = {
    awaiting_submission: {
      label: "Awaiting Submission",
      classes: "bg-gray-100 text-gray-800",
      icon: <Clock className="h-3 w-3 text-gray-500" />,
    },
    pending: {
      label: "Under Review",
      classes: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="h-3 w-3 text-yellow-600" />,
    },
    approved: {
      label: "Approved",
      classes: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-3 w-3 text-green-600" />,
    },
    declined: {
      label: "Declined",
      classes: "bg-red-100 text-red-800",
      icon: <XCircle className="h-3 w-3 text-red-600" />,
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <SubmitClaimModal
        show={showSubmitModal}
        claim={claim}
        documents={documents}
        claimDetails={claimDetails}
        setClaimDetails={setClaimDetails}
        submitting={submitting}
        formError={formError}
        onClose={closeSubmitModal}
        onFileChange={handleFileChange}
        onRemoveFile={handleRemoveFile}
        onSubmit={handleSubmitClaim}
      />

      <WithdrawModal
        show={showWithdrawModal}
        claim={claim}
        withdrawalDetails={withdrawalDetails}
        setWithdrawalDetails={setWithdrawalDetails}
        withdrawing={withdrawing}
        withdrawError={withdrawError}
        verifying={verifying}
        verified={verified}
        onClose={closeWithdrawModal}
        onBankSelect={handleBankSelect}
        onAccountNumberChange={handleAccountNumberChange}
        onSubmit={handleRequestWithdrawal}
      />

      <motion.div
        variants={itemVariants}
        className="flex justify-between items-start flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your DWC merchant claims
          </p>
        </div>

        <button
          onClick={handleCreateClaim}
          disabled={
            loading ||
            creating ||
            (!user?.claimEnabled && !user?.isOnApprovedList) ||
            claim !== null
          }
          className={`btn-primary p-1 flex items-center gap-1 ${
            creating ||
            loading ||
            (!user?.claimEnabled && !user?.isOnApprovedList) ||
            claim !== null
              ? "opacity-70 cursor-not-allowed"
              : ""
          }`}
        >
          {creating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Claim
            </>
          )}
        </button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
      >
        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">How it works</p>
          <p className="mt-1 text-blue-700">
            Create a claim to receive a unique claim number, then submit your
            claim. Once approved, you can request a withdrawal by submitting
            your account details.
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Claims</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : claim === null ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No claims yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first claim to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <motion.div
              key={claim._id}
              variants={itemVariants}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-mono font-semibold text-gray-900">
                      {claim.claimNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusMeta[claim.status]?.classes}`}
                    >
                      {statusMeta[claim.status]?.icon}
                      {statusMeta[claim.status]?.label}
                    </span>

                    {claim.upgradeType && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          claim.upgradeType === "SMEDAN_CAC"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {claim.upgradeType === "SMEDAN_CAC"
                          ? "SMEDAN & CAC"
                          : "Business/Cooperative"}
                      </span>
                    )}
                  </div>

                  {claim.status === "declined" && claim.declineReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      <span className="font-medium">Reason: </span>
                      {claim.declineReason}
                    </div>
                  )}

                  {claim.status === "approved" &&
                    claim.details?.withdrawalAuthCode && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                        <div className="font-medium">
                          Withdrawal Authorization Code
                        </div>
                        <div className="font-mono tracking-wider mt-0.5">
                          {claim.details?.withdrawalAuthCode}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  {claim.status === "awaiting_submission" && (
                    <button
                      disabled={submitting}
                      onClick={handleSubmitClaim}
                      className={`btn-primary px-4 py-2 flex items-center gap-2 ${
                        submitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-2 w-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" />
                          Submit Claim
                        </>
                      )}
                    </button>
                  )}

                  {claim.status === "pending" && (
                    <div className="text-xs text-gray-500 text-right">
                      <Clock className="h-4 w-4 text-yellow-500 inline mr-1" />
                      Under admin review
                    </div>
                  )}

                  {claim.status === "approved" && (
                    <>
                      <div className="text-xs text-green-600 text-right mb-1">
                        <CheckCircle className="h-2 w-2 inline mr-1" />
                        Approved
                      </div>
                      <button
                        onClick={openWithdrawModal}
                        className="btn-primary text-sm px-3 py-1 flex items-center gap-2"
                      >
                        <Wallet className="h-2 w-2" />
                        Request Withdrawal
                      </button>
                    </>
                  )}

                  {claim.status === "declined" && (
                    <div className="text-xs text-red-600 text-right">
                      <XCircle className="h-3 w-3 inline mr-1" />
                      Declined
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MerchantClaim;
