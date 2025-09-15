import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Shield,
  Bell,
  Check,
  X,
  CreditCard,
  LogOut,
  Clock,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { formatCurrency, formatDate } from "../utils/formatters";
import KYCMethod from "../components/KYCMethod";
import VerificationStatus from "../components/KYCStatus";

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("personal");

  const [verificationMethod, setVerificationMethod] = useState<
    "bvn" | "nin" | "cac" | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update user information
    updateUser({
      fullName: formData.fullName,
      email: formData.email,
    });

    setIsEditing(false);
    setSuccessMessage("Profile updated successfully");

    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  const formatAccountType = (type: "individual" | "merchant" | "business") => {
    switch (type) {
      case "individual":
        return "Individual";
      case "business":
        return "Business";
      case "merchant":
        return "Merchant";
      default:
        return "Normal";
    }
  };

  const renderTierRequirements = () => {
    const currentTier = user?.tier || "individual";
    // const isVerified = user?.isKYC === "verified";

    return (
      <div className="mt-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Account Tier Benefits
        </h3>

        <div className="grid lg:grid-cols-3 gap-3 md:grid-cols-1">
          {/* Personal Tier */}
          <div
            className={`border rounded-lg p-3 h-fit w-fit md:w-[100%] ${
              currentTier === "individual"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200"
            }`}
          >
            <h4 className="font-medium text-gray-900 flex items-center">
              {currentTier === "individual" && (
                <Check className="h-4 w-4 text-primary-600 mr-2" />
              )}
              Personal Tier
            </h4>

            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Bill payments only</span>
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>No KYC required</span>
              </li>
              <li className="flex items-start">
                <X className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span>No transfers allowed</span>
              </li>
              <li className="flex items-start">
                <X className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span>No virtual cards</span>
              </li>
            </ul>
          </div>

          {/* Business Tier */}
          <div
            className={`border rounded-lg p-3 h-fit w-fit md:w-[100%] ${
              currentTier === "business"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200"
            }`}
          >
            <h4 className="font-medium text-gray-900 flex items-center">
              {currentTier === "business" && (
                <Check className="h-4 w-4 text-primary-600 mr-2" />
              )}
              Business Tier
            </h4>

            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                {currentTier === "business" ? (
                  <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <span>NIN verification required</span>
              </li>

              <li className="flex items-start">
                {currentTier === "business" ? (
                  <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                )}

                <span>
                  CAC Registration/ <br /> Legal Search and Verification
                  required
                </span>
              </li>

              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Transfers up to ₦10,000 per transaction</span>
              </li>

              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Daily limit: ₦50,000</span>
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Monthly limit: ₦250,000</span>
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Virtual Naira & USD cards</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>5-hour cooldown between transfers</span>
              </li>
            </ul>

            {currentTier === "individual" && (
              <button
                type="button"
                className="btn btn-primary my-2 w-full"
                onClick={() => setActiveTab("kyc")}
              >
                Upgrade
              </button>
            )}
          </div>

          {/* Merchant Tier */}
          <div
            className={`border rounded-lg p-3 h-fit w-fit md:w-[100%] ${
              currentTier === "merchant"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200"
            }`}
          >
            <h4 className="font-medium text-gray-900 flex items-center">
              {currentTier === "merchant" && (
                <Check className="h-4 w-4 text-primary-600 mr-2" />
              )}
              Merchant Tier
            </h4>

            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                {currentTier === "merchant" ? (
                  <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <span>
                  NIN, CAC/Legal Search and Verification & BVN verification
                  required
                </span>
              </li>

              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>All Business tier benefits</span>
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>USDT receiving capability</span>
              </li>
              <li className="flex items-start">
                <Check className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Monthly limit: ₦500,000</span>
              </li>
              <li className="flex items-start">
                <DollarSign className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Upgrade fee of $15</span>
              </li>
            </ul>

            {currentTier === "business" && (
              <button
                type="button"
                className="btn btn-primary my-2 w-full"
                onClick={() => setActiveTab("kyc")}
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {currentTier === "individual" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>

              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Upgrade Your Account
                </h3>

                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    To access transfers, virtual cards, and higher limits,
                    upgrade to Business or Merchant tier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 mb-6">
          Manage your account information and settings
        </p>
      </motion.div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="md:flex">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 p-4 border-r border-gray-200">
            <div className="flex flex-col items-center py-5">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mb-1">
                <User size={40} />
              </div>

              <h3 className="text-lg font-medium text-gray-900">
                {user?.fullName}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="mt-1 text-xs text-gray-700">
                Account Type: {formatAccountType(user?.tier!)}
              </p>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("personal")}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm font-medium ${
                  activeTab === "personal"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User size={22} className="mr-3" />
                Personal Information
              </button>

              <button
                onClick={() => {
                  // alert("Coming Soon");
                  setActiveTab("kyc");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm font-medium ${
                  activeTab === "kyc"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Shield size={22} className="mr-3" />
                KYC Verification
              </button>

              <button
                // onClick={() => setActiveTab("security")}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm font-medium ${
                  activeTab === "security"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Lock size={18} className="mr-3" />
                Security
              </button>

              <button
                // onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm font-medium ${
                  activeTab === "notifications"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bell size={18} className="mr-3" />
                Notifications
              </button>

              <button
                // onClick={() => setActiveTab("payment")}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm font-medium ${
                  activeTab === "payment"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <CreditCard size={18} className="mr-3" />
                Payment Methods
              </button>
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-3" />
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="md:flex-1 p-6">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {activeTab === "personal" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  {/* {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit Information
                    </button>
                  )} */}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name
                        </label>

                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                          </div>

                          <input
                            type="text"
                            id="name"
                            name="name"
                            className="input pl-10"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email Address
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="input pl-10"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone Number
                        </label>

                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-3 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="input pl-10"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            fullName: user?.fullName || "",
                            email: user?.email || "",
                            phone: "555-123-4567",
                          });
                        }}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>

                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex border-b border-gray-200 py-3">
                      <span className="text-sm font-medium text-gray-500 w-1/3">
                        Full Name
                      </span>
                      <span className="text-sm text-gray-900">
                        {user?.fullName}
                      </span>
                    </div>

                    <div className="flex border-b border-gray-200 py-3">
                      <span className="text-sm font-medium text-gray-500 w-1/3">
                        Email Address
                      </span>
                      <span className="text-sm text-gray-900">
                        {user?.email}
                      </span>
                    </div>

                    <div className="flex border-b border-gray-200 py-3">
                      <span className="text-sm font-medium text-gray-500 w-1/3">
                        Phone Number
                      </span>
                      <span className="text-sm text-gray-900">
                        {user?.phoneNumber}
                      </span>
                    </div>

                    <div className="flex py-3">
                      <span className="text-sm font-medium text-gray-500 w-1/3">
                        Member Since
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatDate(user?.joinDate!)}
                      </span>
                    </div>
                  </div>
                )}

                {renderTierRequirements()}
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Security Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <Lock className="h-3 w-3 text-primary-600" />
                        </div>

                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Password
                          </p>
                          <p className="text-xs text-gray-500">
                            Change your password
                            {/* Last changed 3 months ago */}
                          </p>
                        </div>
                      </div>

                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="p-1 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <Shield className="h-3 w-3 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Two-Factor Authentication
                          </p>
                          <p className="text-xs text-gray-500">
                            Add an extra layer of security
                          </p>
                        </div>
                      </div>

                      <button className="relative inline-flex items-center h-3 rounded-full w-3 transition-colors ease-in-out duration-200 bg-gray-200">
                        <span className="sr-only">
                          Enable two-factor authentication
                        </span>
                        <span className="inline-block h-1 w-1 transform rounded-full bg-white translate-x-1"></span>
                      </button>
                    </div>
                  </div>

                  {/* <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-primary-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Login Sessions
                          </p>
                          <p className="text-xs text-gray-500">
                            Manage your active sessions
                          </p>
                        </div>
                      </div>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View
                      </button>
                    </div>
                  </div> */}
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="transaction"
                              name="transaction"
                              type="checkbox"
                              defaultChecked
                              className="h-2 w-2 text-primary-600 border-gray-300 rounded"
                            />
                          </div>

                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="transaction"
                              className="font-medium text-gray-700"
                            >
                              Transaction Notifications
                            </label>
                            <p className="text-gray-500">
                              Receive emails for all transactions
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="security"
                              name="security"
                              type="checkbox"
                              defaultChecked
                              className="h-2 w-2 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="security"
                              className="font-medium text-gray-700"
                            >
                              Security Alerts
                            </label>

                            <p className="text-gray-500">
                              Receive security alert emails
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="marketing"
                              name="marketing"
                              type="checkbox"
                              className="h-2 w-2 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="marketing"
                              className="font-medium text-gray-700"
                            >
                              Marketing Updates
                            </label>
                            <p className="text-gray-500">
                              Receive marketing and promotional emails
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="push-transactions"
                              name="push-transactions"
                              type="checkbox"
                              defaultChecked
                              className="h-2 w-2 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="push-transactions"
                              className="font-medium text-gray-700"
                            >
                              Transaction Alerts
                            </label>
                            <p className="text-gray-500">
                              Receive push notifications for transactions
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="push-security"
                              name="push-security"
                              type="checkbox"
                              defaultChecked
                              className="h-2 w-2 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label
                              htmlFor="push-security"
                              className="font-medium text-gray-700"
                            >
                              Security Alerts
                            </label>
                            <p className="text-gray-500">
                              Receive push notifications for security events
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" className="btn btn-primary">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "kyc" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    KYC Verification
                  </h2>
                </div>

                <div className="space-y-4">
                  {(user?.tier === "business" || "individual") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Shield className="h-5 w-5 text-blue-400" />
                        </div>

                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Identity Verification
                          </h3>

                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              To comply with regulations, we require you to
                              verify your identity, using NIN and CAC
                              Verification/Legal Search and Verification, which
                              will incure a service charge of{" "}
                              {formatCurrency(1000)} and {formatCurrency(5500)}{" "}
                              appropriately.
                            </p>

                            <p className="mt-1">
                              Click the button below to get started.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-2">
                      KYC Requirements for Your Tier
                    </h3>

                    <div className="text-sm text-green-700">
                      {user?.tier === "business" && (
                        <p>
                          Business tier requires NIN verification to access
                          transfers and virtual cards.
                        </p>
                      )}

                      {user?.tier === "merchant" && (
                        <p>
                          Merchant tier requires both NIN and BVN verification,
                          plus CAC/Legal Search and Verification documentation.
                        </p>
                      )}

                      {user?.tier === "individual" && (
                        <p>
                          Personal tier doesn't require KYC but has limited
                          functionality.
                        </p>
                      )}
                    </div>
                  </div>

                  {user?.isKYC === "verified" ? (
                    <>
                      {user?.tier === "business" &&
                        user?.ninVerified &&
                        user?.cacVerified && (
                          <VerificationStatus
                            state={user?.isKYC}
                            type="nin & cac/legal search"
                          />
                        )}

                      {user?.tier === "merchant" && user?.bvnVerified && (
                        <VerificationStatus state={user?.isKYC} type="bvn" />
                      )}

                      {user?.tier === "business" && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-3 bg-blue-50 border-b border-blue-200">
                            <h3 className="text-lg font-medium text-gray-900">
                              Upgrade to Merchant Tier
                            </h3>
                          </div>

                          <div className="p-4">
                            <p className="text-sm text-gray-600 mb-4">
                              BVN Verification is required to upgrade to a
                              merchant tier. Verify your identity using your
                              Bank Verification Number (BVN).
                            </p>

                            <button
                              disabled={verificationMethod === "bvn"}
                              onClick={() => setVerificationMethod("bvn")}
                              className="w-full btn bg-blue-600 text-white"
                            >
                              Get Started
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : user?.isKYC === "pending" ? null : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900">
                            NIN and CAC Verification
                          </h3>
                        </div>

                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-4">
                            Verify your identity using your National
                            Identification Number (NIN) and your business
                            registration with Corporate Affairs Commission.
                            Required for Business accounts.
                          </p>

                          <button
                            // disabled
                            disabled={verificationMethod === "nin"}
                            onClick={() => {
                              if (user?.ninVerified) {
                                setVerificationMethod("cac");
                              }

                              setVerificationMethod("nin");
                            }}
                            className="w-full btn btn-primary"
                          >
                            Start NIN & CAC Verification
                            {/* Coming Soon */}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {user?.isKYC === "pending" && (
                    <>
                      {user?.tier === "individual" && (
                        <VerificationStatus
                          state={user?.isKYC}
                          type="nin & cac/legal search"
                        />
                      )}

                      {user?.tier === "business" && (
                        <VerificationStatus state={user?.isKYC} type="bvn" />
                      )}
                    </>
                  )}

                  {verificationMethod && (
                    <KYCMethod
                      method={verificationMethod}
                      onCancel={() => setVerificationMethod(null)}
                      setMethod={setVerificationMethod}
                      onComplete={() => {
                        setVerificationMethod(null);
                        // Handle successful verification
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Methods
                  </h2>
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Add New
                  </button>
                </div>

                <div className="space-y-4"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
