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
  DollarSign,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuthStore } from "../stores/authStore";
// import { createClaim, submitClaim, viewClaimStatus } from "@/services/claims";

// ================= TYPES =================
type ClaimStatus = "awaiting_submission" | "pending" | "approved" | "declined";

type Claim = {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  claimNumber: string;
  details?: Record<string, any>;
  status: ClaimStatus;
  reviewedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  reviewedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
};

// ================= DUMMY DATA =================
const dummyClaims: Claim[] = [
  {
    _id: "c1",
    user: {
      _id: "u1",
      fullName: "John Doe",
      email: "john.doe@example.com",
      phoneNumber: "+2348012345678",
    },
    claimNumber: "DWC-2025-001",
    details: {},
    status: "awaiting_submission",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z",
  },
];

// ================= DOCUMENT SLOTS =================
type DocumentSlot = {
  id: string;
  fieldName: string;
  name: string;
  required: boolean;
  description: string;
  file: File | null;
  uploaded: boolean;
  status: "pending" | "uploading" | "uploaded" | "error";
};

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

const MIN_WITHDRAWAL = 2;
const MAX_WITHDRAWAL = 1000;

const MerchantClaim = () => {
  const { user } = useAuthStore();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [documents, setDocuments] = useState<DocumentSlot[]>(
    createClaimDocuments(),
  );
  const [claimDetails, setClaimDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    withdrawalAmount: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchClaims = async () => {
    // setLoading(true);
    // try {
    //   await new Promise((resolve) => setTimeout(resolve, 700));
    //   setClaims(dummyClaims);
    // } catch (error) {
    //   console.error(error);
    //   toast.error("Failed to load your claims");
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleCreateClaim = async () => {
    if (!user?.claimEnabled && !user?.isOnApprovedList) {
      return toast("Your account is not eligible to create a claim yet.");
    }

    try {
      setCreating(true);

      await new Promise((resolve) => setTimeout(resolve, 800));

      // In production:
      // const res = await createClaim();
      // setClaims((prev) => [res.data.data, ...prev]);

      const newClaim: Claim = {
        _id: `c${Date.now()}`,
        user: {
          _id: "u1",
          fullName: "John Doe",
          email: "john.doe@example.com",
          phoneNumber: "+2348012345678",
        },
        claimNumber: `DWC-2025-${String(claims.length + 1).padStart(3, "0")}`,
        details: {},
        status: "awaiting_submission",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setClaims((prev) => [newClaim, ...prev]);
      toast.success("Claim created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create claim");
    } finally {
      setCreating(false);
    }
  };

  // ================= SUBMIT MODAL =================
  const openSubmitModal = (claim: Claim) => {
    setSelectedClaim(claim);
    setDocuments(createClaimDocuments());
    setClaimDetails({
      accountName: "",
      accountNumber: "",
      bankName: "",
      withdrawalAmount: "",
    });
    setFormError("");
    setShowSubmitModal(true);
  };

  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedClaim(null);
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
    if (!selectedClaim) return;

    const missing = documents.filter((d) => d.required && !d.uploaded);
    if (missing.length > 0) {
      setFormError(
        `Please upload all required documents: ${missing
          .map((m) => m.name)
          .join(", ")}`,
      );
      return;
    }

    const amount = parseFloat(claimDetails.withdrawalAmount);
    if (!amount || isNaN(amount)) {
      setFormError("Please enter a valid withdrawal amount");
      return;
    }
    if (amount < MIN_WITHDRAWAL) {
      setFormError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}`);
      return;
    }
    if (amount > MAX_WITHDRAWAL) {
      setFormError(`Maximum withdrawal amount is $${MAX_WITHDRAWAL}`);
      return;
    }

    if (
      !claimDetails.accountName.trim() ||
      !claimDetails.accountNumber.trim() ||
      !claimDetails.bankName.trim()
    ) {
      setFormError("Please fill in all account details");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // In production:
      // const formData = new FormData();
      // documents.forEach((doc) => {
      //   if (doc.file) formData.append(doc.fieldName, doc.file);
      // });
      // formData.append("accountName", claimDetails.accountName);
      // formData.append("accountNumber", claimDetails.accountNumber);
      // formData.append("bankName", claimDetails.bankName);
      // formData.append("withdrawalAmount", claimDetails.withdrawalAmount);
      // const res = await submitClaim(selectedClaim._id, formData);

      setClaims((prev) =>
        prev.map((c) =>
          c._id === selectedClaim._id
            ? {
                ...c,
                status: "pending",
                details: {
                  ...c.details,
                  accountName: claimDetails.accountName,
                  accountNumber: claimDetails.accountNumber,
                  bankName: claimDetails.bankName,
                  withdrawalAmount: amount,
                },
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );

      toast.success("Claim submitted successfully!");
      closeSubmitModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit claim");
    } finally {
      setSubmitting(false);
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
      icon: <Clock className="h-3.5 w-3.5 text-gray-500" />,
    },
    pending: {
      label: "Under Review",
      classes: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="h-3.5 w-3.5 text-yellow-600" />,
    },
    approved: {
      label: "Approved",
      classes: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-3.5 w-3.5 text-green-600" />,
    },
    declined: {
      label: "Declined",
      classes: "bg-red-100 text-red-800",
      icon: <XCircle className="h-3.5 w-3.5 text-red-600" />,
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

  // ================= SUBMIT MODAL COMPONENT =================
  const SubmitClaimModal = () => {
    if (!showSubmitModal || !selectedClaim) return null;

    const allRequiredUploaded = documents
      .filter((d) => d.required)
      .every((d) => d.uploaded);

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto"
        >
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
                  {selectedClaim.claimNumber}
                </p>
              </div>
            </div>
            <button
              onClick={closeSubmitModal}
              disabled={submitting}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitClaim} className="p-4 space-y-6">
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
                            handleFileChange(
                              doc.id,
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>

                      {doc.uploaded && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(doc.id)}
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
                      min={MIN_WITHDRAWAL}
                      max={MAX_WITHDRAWAL}
                      step="0.01"
                      className="input-field w-full text-sm pl-6"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Min: ${MIN_WITHDRAWAL} | Max: ${MAX_WITHDRAWAL}
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
                onClick={closeSubmitModal}
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
        </motion.div>
      </div>
    );
  };

  // ================= RENDER =================
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <SubmitClaimModal />

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
            creating || (!user?.claimEnabled && !user?.isOnApprovedList)
          }
          className={`btn-primary p-1 flex items-center gap-1 ${
            creating ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {creating ? (
            <>
              <Loader2 className="h-2 w-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-2 w-2" />
              Create Claim
            </>
          )}
        </button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
      >
        <AlertCircle className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">How it works</p>

          <p className="mt-1 text-blue-700">
            Create a claim to receive a unique claim number, then submit your
            claim with your documents and account details. Our team will review
            it and notify you via email.
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Claims</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No claims yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first claim to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => {
              const meta = statusMeta[claim.status];
              const amount = claim.details?.withdrawalAmount;
              const applicationType = claim.details?.applicationType;
              const withdrawalAuthCode = claim.details?.withdrawalAuthCode;

              return (
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
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${meta.classes}`}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>

                        {applicationType && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              applicationType === "SMEDAN_CAC"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {applicationType === "SMEDAN_CAC"
                              ? "SMEDAN & CAC"
                              : "Business/Cooperative"}
                          </span>
                        )}
                      </div>

                      {amount !== undefined && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-700">
                          <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          <span className="font-medium">
                            ${Number(amount).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            withdrawal request
                          </span>
                        </div>
                      )}

                      {claim.status === "declined" && claim.declineReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <span className="font-medium">Reason: </span>
                          {claim.declineReason}
                        </div>
                      )}

                      {claim.status === "approved" && withdrawalAuthCode && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                          <div className="font-medium">
                            Withdrawal Authorization Code
                          </div>
                          <div className="font-mono tracking-wider mt-0.5">
                            {withdrawalAuthCode}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {claim.status === "awaiting_submission" && (
                        <button
                          onClick={() => openSubmitModal(claim)}
                          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Submit Claim
                        </button>
                      )}

                      {claim.status === "pending" && (
                        <div className="text-xs text-gray-500 text-right">
                          <Clock className="h-4 w-4 text-yellow-500 inline mr-1" />
                          Under admin review
                        </div>
                      )}

                      {claim.status === "approved" && (
                        <div className="text-xs text-green-600 text-right">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Approved
                        </div>
                      )}

                      {claim.status === "declined" && (
                        <div className="text-xs text-red-600 text-right">
                          <XCircle className="h-4 w-4 inline mr-1" />
                          Declined
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MerchantClaim;
