import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Activity,
  RefreshCw,
  Download,
  AlertTriangle,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const DeveloperSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    environment: "production",
    rateLimitNotifications: true,
    webhookRetries: 3,
    logRetention: 30,
    enableDebugMode: false,
    ipWhitelist: [] as string[],
  });
  
  const [newIpAddress, setNewIpAddress] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState("whsec_8f9a2b3c4d5e6f7g8h9i0j1k2l3m4n5o");

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

  const handleSaveSettings = () => {
    toast.success("Developer settings saved successfully");
  };

  const handleRegenerateWebhookSecret = () => {
    if (window.confirm("Are you sure you want to regenerate your webhook signing secret? This will affect all webhook signature verifications.")) {
      setIsRegenerating(true);
      setTimeout(() => {
        setWebhookSecret(`whsec_${Math.random().toString(36).substring(2, 30)}`);
        setIsRegenerating(false);
        toast.success("Webhook secret regenerated successfully");
      }, 1500);
    }
  };

  const handleAddIpAddress = () => {
    if (!newIpAddress) {
      toast.error("Please enter an IP address");
      return;
    }
    
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIpAddress)) {
      toast.error("Please enter a valid IP address");
      return;
    }
    
    if (settings.ipWhitelist.includes(newIpAddress)) {
      toast.error("IP address already in whitelist");
      return;
    }
    
    setSettings({
      ...settings,
      ipWhitelist: [...settings.ipWhitelist, newIpAddress],
    });
    setNewIpAddress("");
    toast.success("IP address added to whitelist");
  };

  const handleRemoveIpAddress = (ip: string) => {
    setSettings({
      ...settings,
      ipWhitelist: settings.ipWhitelist.filter(i => i !== ip),
    });
    toast.success("IP address removed from whitelist");
  };

  const handleExportLogs = () => {
    toast.success("Log export initiated. You'll receive an email when ready.");
  };

  return (
    <>
      <Helmet>
        <title>Go Flexi | Developer Settings</title>
        <meta name="description" content="Configure developer settings for Go Flexi" />
      </Helmet>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Developer Settings</h1>
          <p className="text-gray-600">
            Configure API and integration settings for your development environment
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          {/* API Configuration */}
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="sandbox"
                      checked={settings.environment === "sandbox"}
                      onChange={() => setSettings({ ...settings, environment: "sandbox" })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Sandbox (Test)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="production"
                      checked={settings.environment === "production"}
                      onChange={() => setSettings({ ...settings, environment: "production" })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Production (Live)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sandbox environment uses test API keys and doesn't process real money
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Signing Secret
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded font-mono text-sm">
                    {webhookSecret}
                  </code>
                  <button
                    onClick={handleRegenerateWebhookSecret}
                    disabled={isRegenerating}
                    className="px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded disabled:opacity-50"
                  >
                    {isRegenerating ? <RefreshCw size={16} className="animate-spin" /> : "Regenerate"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used to verify webhook signatures. Keep this secret secure.
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Rate Limiting</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Rate Limits
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Requests per minute</p>
                    <p className="text-xl font-semibold text-gray-900">1,000</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Requests per hour</p>
                    <p className="text-xl font-semibold text-gray-900">10,000</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Rate Limit Notifications</p>
                  <p className="text-xs text-gray-500">Email when approaching rate limits</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, rateLimitNotifications: !settings.rateLimitNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.rateLimitNotifications ? "bg-primary-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.rateLimitNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Retry Attempts
                </label>
                <select
                  value={settings.webhookRetries}
                  onChange={(e) => setSettings({ ...settings, webhookRetries: parseInt(e.target.value) })}
                  className="input w-32"
                >
                  <option value={1}>1 attempt</option>
                  <option value={2}>2 attempts</option>
                  <option value={3}>3 attempts</option>
                  <option value={5}>5 attempts</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Number of retry attempts for failed webhook deliveries
                </p>
              </div>
            </div>
          </div>

          {/* IP Whitelist */}
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">IP Whitelist</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Restrict API access to specific IP addresses. Leave empty to allow all IPs.
              </p>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  placeholder="192.168.1.1"
                  className="input flex-1"
                />
                <button onClick={handleAddIpAddress} className="btn btn-primary">
                  Add IP
                </button>
              </div>

              {settings.ipWhitelist.length > 0 && (
                <div className="space-y-2">
                  {settings.ipWhitelist.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <code className="text-sm font-mono">{ip}</code>
                      <button
                        onClick={() => handleRemoveIpAddress(ip)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logging & Debugging */}
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Logging & Debugging</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Debug Mode</p>
                  <p className="text-xs text-gray-500">Enable detailed error logging</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enableDebugMode: !settings.enableDebugMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enableDebugMode ? "bg-primary-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableDebugMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Log Retention (days)
                </label>
                <select
                  value={settings.logRetention}
                  onChange={(e) => setSettings({ ...settings, logRetention: parseInt(e.target.value) })}
                  className="input w-32"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleExportLogs}
                  className="btn btn-outline flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Export API Logs
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-card overflow-hidden">
            <div className="p-4 border-b border-red-200 bg-red-100">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-700 mr-2" />
                <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">Revoke All API Keys</p>
                  <p className="text-xs text-red-700">Immediately revoke all active API keys</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("WARNING: This will revoke all API keys immediately. This action cannot be undone. Continue?")) {
                      toast.error("All API keys have been revoked");
                    }
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Revoke All
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">Reset Webhook Configuration</p>
                  <p className="text-xs text-red-700">Remove all webhook endpoints and settings</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("WARNING: This will delete all webhook configurations. This action cannot be undone. Continue?")) {
                      toast.error("All webhook configurations have been reset");
                    }
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button onClick={handleSaveSettings} className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default DeveloperSettings;