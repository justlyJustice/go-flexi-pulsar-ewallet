import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPDFList } from "../services/pdf-lists";
import { useAuthStore } from "../stores/authStore";

type UpgradeType = "SMEDAN_CAC" | "BUSINESS_COOPERATIVE";

const upgradeTypeMeta: Record<
  UpgradeType,
  { label: string; description: string; badgeClasses: string }
> = {
  SMEDAN_CAC: {
    label: "SMEDAN & CAC",
    description:
      "This list contains all users who upgraded with SMEDAN & CAC documentation.",
    badgeClasses: "bg-purple-100 text-purple-800",
  },
  BUSINESS_COOPERATIVE: {
    label: "Business/Cooperative",
    description:
      "This list contains all users who upgraded with Business/Cooperative documentation.",
    badgeClasses: "bg-orange-100 text-orange-800",
  },
};

const PDFList = () => {
  const { user } = useAuthStore();

  // Derive the user's upgrade type (falls back to SMEDAN_CAC if unset)
  const upgradeType: UpgradeType =
    (user?.upgradeType as UpgradeType) || "SMEDAN_CAC";

  const activeTabData = upgradeTypeMeta[upgradeType];

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(false);

  const blobUrlRef = useRef<string | null>(null);

  /**
   * Revoke the previous Blob URL to prevent memory leaks.
   */
  const revokeCurrentBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  useEffect(() => {
    fetchPDFList(upgradeType);

    return () => {
      revokeCurrentBlob();
    };
  }, [upgradeType]);

  const fetchPDFList = async (type: UpgradeType) => {
    setLoading(true);
    setError(null);
    setIframeLoading(true);

    revokeCurrentBlob();
    setPdfUrl(null);

    try {
      const res = await getPDFList(type);

      if (res.status !== 200) {
        throw new Error("Failed to load PDF list.");
      }

      const pdfBlob = res.data;

      if (!(pdfBlob instanceof Blob)) {
        throw new Error(
          "Invalid PDF response. Expected a Blob from the server.",
        );
      }

      const pdf = new Blob([pdfBlob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdf);

      blobUrlRef.current = url;
      setPdfUrl(url);
    } catch (err: any) {
      console.error("Failed to fetch PDF list:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load PDF list. Please try again.";

      setError(message);
      setIframeLoading(false);

      toast.error("Failed to load PDF list");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = `${activeTabData?.label?.replace(
      /\s|\//g,
      "_",
    )}_approved_users.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Downloading PDF...");
  };

  const handleOpenInNewTab = () => {
    if (!pdfUrl) return;

    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const handleRetry = () => {
    fetchPDFList(upgradeType);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
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
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-start flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Approved Users List
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and download the list of approved merchants in your upgrade
            category
          </p>
        </div>

        {pdfUrl && !loading && !error && (
          <div className="flex gap-2 max-sm:flex-col">
            <button
              onClick={handleDownload}
              className="btn-primary p-1 flex items-center gap-2 rounded-md"
            >
              <Download className="h-2 w-2" />
              Download
            </button>
          </div>
        )}
      </motion.div>

      {/* Info banner */}
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
      >
        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />

        <div className="text-sm text-blue-800">
          <p className="font-medium">Your Upgrade Type</p>
          <p className="mt-1 text-blue-700">{activeTabData?.description}</p>
        </div>
      </motion.div>

      {/* PDF Viewer Card */}
      <motion.div variants={itemVariants} className="card p-0 overflow-hidden">
        {/* Card Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {activeTabData?.label} Users List
              </h2>

              <p className="text-xs text-gray-500">
                {activeTabData?.description}
              </p>
            </div>
          </div>

          {pdfUrl && !loading && !error && (
            <button
              onClick={handleOpenInNewTab}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </button>
          )}
        </div>

        {/* PDF Content */}
        <div
          className="relative w-full bg-gray-50"
          style={{ minHeight: "600px" }}
        >
          {/* API Loading */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
              <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />

              <p className="mt-3 text-sm text-gray-500">Loading PDF list...</p>

              <p className="mt-1 text-xs text-gray-400">
                This may take a few moments
              </p>
            </div>
          )}

          {/* Iframe Loading */}
          {!loading && iframeLoading && pdfUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
              <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />

              <p className="mt-3 text-sm text-gray-500">
                Rendering PDF viewer...
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-6">
              <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>

              <p className="text-base font-medium text-red-800">
                Failed to load PDF
              </p>

              <p className="mt-1 text-sm text-red-600 text-center max-w-md">
                {error}
              </p>

              <button
                onClick={handleRetry}
                className="btn-primary px-4 py-2 text-sm mt-5"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !pdfUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
              <FileText className="h-12 w-12 text-gray-300" />

              <p className="mt-3 text-sm text-gray-500">
                No PDF available for this list yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Check back later once users have been approved
              </p>
            </div>
          )}

          {/* PDF Iframe */}
          {pdfUrl && !loading && !error && (
            <iframe
              key={pdfUrl}
              src={pdfUrl}
              className={`w-full transition-opacity duration-300 ${iframeLoading ? "opacity-0" : "opacity-100"}`}
              style={{
                height: "75vh",
                minHeight: "600px",
                border: "none",
              }}
              onLoad={() => setIframeLoading(false)}
              onError={() => {
                setIframeLoading(false);
                setError(
                  "Failed to display PDF. Please try downloading instead.",
                );
              }}
              title={`${activeTabData?.label} Users PDF List`}
            />
          )}
        </div>

        {/* Footer */}
        {pdfUrl && !loading && !error && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
            <p className="text-xs text-gray-500">
              List: <span className="font-medium">{activeTabData?.label}</span>
            </p>

            <p className="text-xs text-gray-500">
              If the PDF doesn't display properly,{" "}
              <button
                onClick={handleDownload}
                className="text-primary-600 hover:underline font-medium"
              >
                click here to download
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PDFList;
