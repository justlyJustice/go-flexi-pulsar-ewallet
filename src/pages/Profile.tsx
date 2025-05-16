import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Shield,
  Bell,
  CreditCard,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "555-123-4567", // Demo data
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
      name: formData.name,
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
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mb-3">
                <User size={40} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {user?.name}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            <nav className="mt-6 space-y-1">
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
                onClick={() => setActiveTab("security")}
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
                onClick={() => setActiveTab("notifications")}
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
                onClick={() => setActiveTab("payment")}
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
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit Information
                    </button>
                  )}
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
                            value={formData.name}
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
                            name: user?.name || "",
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
                        {user?.name}
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
                        555-123-4567
                      </span>
                    </div>

                    <div className="flex py-3">
                      <span className="text-sm font-medium text-gray-500 w-1/3">
                        Member Since
                      </span>
                      <span className="text-sm text-gray-900">
                        January 2023
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Security Settings
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <Lock className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Password
                          </p>
                          <p className="text-xs text-gray-500">
                            Last changed 3 months ago
                          </p>
                        </div>
                      </div>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <Shield className="h-5 w-5 text-primary-600" />
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
                      <button className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors ease-in-out duration-200 bg-gray-200">
                        <span className="sr-only">
                          Enable two-factor authentication
                        </span>
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1"></span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary-600"
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
                  </div>
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

                <div className="space-y-6">
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
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
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
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
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
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
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
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
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
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
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

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="1"
                            y="4"
                            width="22"
                            height="16"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Visa ending in 4242
                        </p>
                        <p className="text-xs text-gray-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                        Default
                      </span>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Edit
                      </button>
                      <button className="text-sm text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="1"
                            y="4"
                            width="22"
                            height="16"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Mastercard ending in 8888
                        </p>
                        <p className="text-xs text-gray-500">Expires 08/2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Make Default
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Edit
                      </button>
                      <button className="text-sm text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 border-dashed rounded-lg">
                    <div className="flex items-center justify-center py-4">
                      <button className="flex items-center text-primary-600 hover:text-primary-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add a new payment method
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
