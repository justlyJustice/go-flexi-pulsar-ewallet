import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  AlertCircle,
  Check,
  X,
  Loader2,
  Clock,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadDWCApplication } from "../services/applications";
import { useAuthStore } from "../stores/authStore";

export interface Document {
  id: string;
  name: string;
  required: boolean;
  description: string;
  file: File | null;
  uploaded: boolean;
  status: "pending" | "uploading" | "uploaded" | "error";
  /** Backend field name for multipart upload */
  fieldName: string;
  /** Whether multiple files are allowed */
  multiple?: boolean;
  maxCount?: number;
}

type ApplicationStatus =
  | undefined
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";

const MerchantVerification = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "grant-acceptance",
      fieldName: "signedGrantAcceptanceForm",
      name: "Signed Grant Acceptance Form",
      required: true,
      description: "Acceptance of grant terms and conditions",
      file: null,
      uploaded: false,
      status: "pending",
    },
    {
      id: "grant-agreement",
      fieldName: "signedGrantAgreement",
      name: "Signed Grant Agreement",
      required: true,
      description: "Official grant agreement document",
      file: null,
      uploaded: false,
      status: "pending",
    },
    {
      id: "beneficiary-declaration",
      fieldName: "signedBeneficiaryDeclaration",
      name: "Signed Beneficiary Declaration",
      required: true,
      description: "Declaration of beneficiary status",
      file: null,
      uploaded: false,
      status: "pending",
    },
    {
      id: "code-of-conduct",
      fieldName: "signedCodeOfConductAgreement",
      name: "Signed Code of Conduct Agreement",
      required: true,
      description: "Agreement to comply with code of conduct",
      file: null,
      uploaded: false,
      status: "pending",
    },
    {
      id: "anti-fraud",
      fieldName: "signedAntiFraudDeclaration",
      name: "Signed Anti-Fraud Declaration",
      required: true,
      description: "Declaration against fraudulent activities",
      file: null,
      uploaded: false,
      status: "pending",
    },
    {
      id: "conflict-of-interest",
      fieldName: "signedConflictOfInterestDeclaration",
      name: "Signed Conflict of Interest Declaration",
      required: true,
      description: "Declaration of any conflicts of interest",
      file: null,
      uploaded: false,
      status: "pending",
    },
    {
      id: "business-registration",
      fieldName: "businessRegistrationDocuments",
      name: "Business Registration Documents",
      required: false,
      description: "CAC registration or equivalent (up to 5 files, optional)",
      file: null,
      uploaded: false,
      status: "pending",
      multiple: true,
      maxCount: 5,
    },
  ]);
  const { user, updateUser } = useAuthStore((store) => store);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const applicationStatus =
    (user?.applicationStatus as ApplicationStatus) ?? "not_submitted";

  const handleFileChange = (documentId: string, file: File | null) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
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
      toast.success(
        `${documents.find((d) => d.id === documentId)?.name} added successfully`,
      );
    }, 1500);
  };

  const handleRemoveFile = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? { ...doc, file: null, uploaded: false, status: "pending" }
          : doc,
      ),
    );
    if (fileInputRefs.current[documentId]) {
      fileInputRefs.current[documentId]!.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredDocuments = documents.filter((doc) => doc.required);
    const missingDocuments = requiredDocuments.filter((doc) => !doc.uploaded);

    if (missingDocuments.length > 0) {
      toast.error(
        `Please add all required documents: ${missingDocuments
          .map((doc) => doc.name)
          .join(", ")}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await uploadDWCApplication(documents);

      if (res.status !== 200 && res.status !== 201) {
        toast.error(
          res.data?.message || "Something went wrong. Please try again.",
        );
        return;
      }

      setIsComplete(true);
      updateUser({ applicationStatus: "pending" });
      toast.success("All documents submitted successfully!");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit documents. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "uploaded":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "uploading":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const allRequiredUploaded = documents
    .filter((doc) => doc.required)
    .every((doc) => doc.uploaded);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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

  // ============ STATUS PLACEHOLDERS (wrapped in white card) ============

  // 1. Pending - awaiting admin review
  if (applicationStatus === "pending" || isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-card shadow-card p-8"
      >
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Pending
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your merchant verification documents have been submitted
            successfully and are currently under review.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              We'll review your documents within 24-48 hours
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. Approved - verification complete
  if (applicationStatus === "approved") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-card shadow-card p-8"
      >
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Approved
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Congratulations! Your merchant verification has been approved.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              You now have full access to merchant features
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // 3. Rejected - verification failed
  if (applicationStatus === "rejected") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-card shadow-card p-8"
      >
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldX className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Rejected
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Unfortunately, your merchant verification was not approved at this
            time.
          </p>

          {user?.rejectionReason && (
            <div className="max-w-lg mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-medium text-red-800 mb-1">
                Reason for rejection:
              </p>
              <p className="text-sm text-red-700">{user.rejectionReason}</p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            You can re-submit your documents for review. Please ensure all
            information is correct.
          </p>

          <button
            onClick={() => {
              updateUser({ applicationStatus: "not_submitted" });
              setDocuments((prev) =>
                prev.map((doc) => ({
                  ...doc,
                  file: null,
                  uploaded: false,
                  status: "pending",
                })),
              );
              setIsComplete(false);
            }}
            className="btn-primary px-6 py-2"
          >
            Re-submit Documents
          </button>
        </div>
      </motion.div>
    );
  }

  // 4. not_submitted or undefined → show the form
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Merchant Verification
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload the required documents to complete your merchant verification.
          All fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <div className="bg-white p-4 rounded-card shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                variants={itemVariants}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  doc.uploaded
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 hover:border-primary-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">
                        {doc.name}
                        {doc.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {doc.description}
                    </p>
                    {doc.file && (
                      <p className="mt-1 text-xs text-gray-400">
                        {doc.file.name} ({(doc.file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {doc.uploaded && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Uploaded
                      </span>
                    )}
                    {getStatusIcon(doc.status)}
                  </div>
                </div>

                <div className="mt-3 flex items-center space-x-3">
                  <input
                    type="file"
                    id={doc.id}
                    ref={(el) => (fileInputRefs.current[doc.id] = el)}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple={doc.multiple}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange(doc.id, file);
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    disabled={doc.status === "uploading"}
                    className={`btn-outline text-sm px-3 py-1.5 flex items-center ${
                      doc.uploaded ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {doc.uploaded ? "Replace" : "Upload"}
                  </button>

                  {doc.uploaded && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(doc.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-2 ${
                    allRequiredUploaded ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
                <span className="text-sm text-gray-700">
                  Required Documents:{" "}
                  {documents.filter((d) => d.required && d.uploaded).length} of{" "}
                  {documents.filter((d) => d.required).length} uploaded
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {documents.filter((d) => d.uploaded).length} total documents
                uploaded
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || !allRequiredUploaded}
              className={`btn-primary px-8 py-2.5 flex items-center ${
                isSubmitting || !allRequiredUploaded
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Verification"
              )}
            </button>
          </div>

          {!allRequiredUploaded && (
            <p className="text-sm text-yellow-600 text-right">
              Please upload all required documents before submitting.
            </p>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default MerchantVerification;
