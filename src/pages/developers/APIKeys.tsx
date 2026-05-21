import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  status: "active" | "inactive";
  permissions: string[];
}

const APIKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API Key",
      key: "pk_live_4eC39HqLyjWDarjtT1zdp7dc",
      createdAt: "2024-01-15",
      lastUsed: "2024-03-20",
      status: "active",
      permissions: ["read", "write", "transfer"],
    },
    {
      id: "2",
      name: "Test API Key",
      key: "pk_test_51H3bgR2eZvKYlo2C1zt4yB",
      createdAt: "2024-02-01",
      lastUsed: "2024-03-19",
      status: "active",
      permissions: ["read"],
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "read",
  ]);

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
      transition: { duration: 0.4 },
    },
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (visibleKeys.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
      status: "active" as const,
      permissions: selectedPermissions,
    };

    setApiKeys([newKey, ...apiKeys]);
    setShowNewKey(newKey.key);
    setShowCreateModal(false);
    setNewKeyName("");
    setSelectedPermissions(["read"]);
    toast.success("API key created successfully");
  };

  const handleDeleteKey = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast.success("API key deleted successfully");
    }
  };

  const handleToggleStatus = (id: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === id
          ? { ...key, status: key.status === "active" ? "inactive" : "active" }
          : key,
      ),
    );
    toast.success("API key status updated");
  };

  const permissionOptions = [
    {
      value: "read",
      label: "Read",
      description: "View account information and transactions",
    },
    {
      value: "write",
      label: "Write",
      description: "Create transactions and update settings",
    },
    {
      value: "transfer",
      label: "Transfer",
      description: "Initiate money transfers",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Manage API keys and webhooks",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Go Flexi | API Keys</title>
        <meta name="description" content="Manage your API keys for Go Flexi" />
      </Helmet>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">API Keys</h1>
            <p className="text-gray-600">
              Manage your API keys for secure access to Go Flexi's API
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Create API Key
          </button>
        </motion.div>

        {showNewKey && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Save your API key
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This is your only chance to see this API key. Make sure to
                  copy it now.
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-white rounded border border-yellow-300 text-sm font-mono">
                    {showNewKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(showNewKey)}
                    className="p-2 text-yellow-700 hover:bg-yellow-100 rounded"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => setShowNewKey(null)}
                    className="p-2 text-yellow-700 hover:bg-yellow-100 rounded"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-card shadow-card overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Your API Keys
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Keep your API keys secure. Never share them in public or
              client-side code.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {apiKeys.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No API keys created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 text-primary-600 hover:text-primary-700"
                >
                  Create your first API key
                </button>
              </div>
            ) : (
              apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Key className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="font-medium text-gray-900">
                          {apiKey.name}
                        </h3>
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            apiKey.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {apiKey.status}
                        </span>
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {visibleKeys.has(apiKey.id)
                              ? apiKey.key
                              : "•".repeat(40)}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          Created: {apiKey.createdAt}
                        </div>
                        {apiKey.lastUsed && (
                          <div className="flex items-center">
                            <CheckCircle size={12} className="mr-1" />
                            Last used: {apiKey.lastUsed}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {apiKey.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(apiKey.id)}
                        className={`px-3 py-1 text-sm rounded ${
                          apiKey.status === "active"
                            ? "text-yellow-700 hover:bg-yellow-50"
                            : "text-green-700 hover:bg-green-50"
                        }`}
                      >
                        {apiKey.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteKey(apiKey.id, apiKey.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            API Best Practices
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Never commit API keys to version control</li>
            <li>• Rotate your API keys regularly</li>
            <li>• Use different keys for development and production</li>
            <li>• Revoke unused or compromised keys immediately</li>
          </ul>
        </motion.div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Key"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {permissionOptions.map((perm) => (
                      <label key={perm.value} className="flex items-start">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([
                                ...selectedPermissions,
                                perm.value,
                              ]);
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter(
                                  (p) => p !== perm.value,
                                ),
                              );
                            }
                          }}
                          className="mt-0.5 mr-2"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {perm.label}
                          </span>
                          <p className="text-xs text-gray-500">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button onClick={handleCreateKey} className="btn btn-primary">
                  Create Key
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default APIKeys;
