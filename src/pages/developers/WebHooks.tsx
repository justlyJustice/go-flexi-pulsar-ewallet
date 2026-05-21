import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Webhook,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastDelivery: string | null;
  lastSuccess: string | null;
  failureCount: number;
  createdAt: string;
}

const Webhooks: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: "1",
      url: "https://api.myapp.com/webhooks/goflexi",
      events: ["transfer.success", "card.created", "deposit.completed"],
      status: "active",
      lastDelivery: "2024-03-20 14:32:15",
      lastSuccess: "2024-03-20 14:32:15",
      failureCount: 0,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      url: "https://myapp.com/webhooks/payments",
      events: ["transfer.failed", "card.declined"],
      status: "inactive",
      lastDelivery: "2024-03-19 09:15:22",
      lastSuccess: null,
      failureCount: 3,
      createdAt: "2024-02-01",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(
    null,
  );
  const [formData, setFormData] = useState({
    url: "",
    events: [] as string[],
  });
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const eventOptions = [
    { value: "transfer.success", label: "Transfer Successful" },
    { value: "transfer.failed", label: "Transfer Failed" },
    { value: "transfer.pending", label: "Transfer Pending" },
    { value: "card.created", label: "Card Created" },
    { value: "card.activated", label: "Card Activated" },
    { value: "card.declined", label: "Card Declined" },
    { value: "deposit.completed", label: "Deposit Completed" },
    { value: "withdrawal.completed", label: "Withdrawal Completed" },
    { value: "kyc.verified", label: "KYC Verified" },
    { value: "kyc.rejected", label: "KYC Rejected" },
  ];

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

  const handleSaveWebhook = () => {
    if (!formData.url) {
      toast.error("Please enter a webhook URL");
      return;
    }

    if (formData.events.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    if (editingWebhook) {
      setWebhooks(
        webhooks.map((w) =>
          w.id === editingWebhook.id
            ? { ...w, url: formData.url, events: formData.events }
            : w,
        ),
      );
      toast.success("Webhook updated successfully");
    } else {
      const newWebhook: WebhookEndpoint = {
        id: Date.now().toString(),
        url: formData.url,
        events: formData.events,
        status: "active",
        lastDelivery: null,
        lastSuccess: null,
        failureCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setWebhooks([...webhooks, newWebhook]);
      toast.success("Webhook created successfully");
    }

    setShowCreateModal(false);
    setEditingWebhook(null);
    setFormData({ url: "", events: [] });
  };

  const handleDeleteWebhook = (id: string, url: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete webhook endpoint: ${url}?`,
      )
    ) {
      setWebhooks(webhooks.filter((w) => w.id !== id));
      toast.success("Webhook deleted successfully");
    }
  };

  const handleToggleStatus = (id: string) => {
    setWebhooks(
      webhooks.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "active" ? "inactive" : "active" }
          : w,
      ),
    );
    toast.success(
      `Webhook ${webhooks.find((w) => w.id === id)?.status === "active" ? "deactivated" : "activated"}`,
    );
  };

  const testWebhook = async (webhook: WebhookEndpoint) => {
    const testPayload = {
      event: "test.webhook",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook notification",
        webhook_id: webhook.id,
      },
    };

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast.success("Test webhook sent successfully");
      } else {
        toast.error(`Webhook responded with status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Failed to send test webhook");
    }
  };

  const viewDeliveryLogs = (webhookId: string) => {
    // Simulate fetching logs
    const mockLogs = [
      {
        id: 1,
        event: "transfer.success",
        timestamp: "2024-03-20 14:32:15",
        status: "success",
        responseCode: 200,
        duration: "245ms",
      },
      {
        id: 2,
        event: "card.created",
        timestamp: "2024-03-20 10:15:22",
        status: "success",
        responseCode: 200,
        duration: "189ms",
      },
      {
        id: 3,
        event: "transfer.success",
        timestamp: "2024-03-19 22:45:01",
        status: "failed",
        responseCode: 500,
        duration: "312ms",
        error: "Internal server error",
      },
    ];
    setDeliveryLogs(mockLogs);
    setShowLogs(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      <Helmet>
        <title>Go Flexi | Webhooks</title>
        <meta
          name="description"
          content="Manage webhook endpoints for Go Flexi"
        />
      </Helmet>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Webhooks</h1>
            <p className="text-gray-600">
              Receive real-time notifications about events in your account
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add Endpoint
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          {webhooks.length === 0 ? (
            <div className="bg-white rounded-card shadow-card p-8 text-center">
              <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No webhook endpoints configured</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-primary-600 hover:text-primary-700"
              >
                Create your first webhook
              </button>
            </div>
          ) : (
            webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="bg-white rounded-card shadow-card overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Webhook className="h-5 w-5 text-gray-400 mr-2" />
                        <code className="text-sm font-mono text-gray-900">
                          {webhook.url}
                        </code>
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            webhook.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {webhook.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Created</p>
                          <p className="font-medium text-gray-900">
                            {webhook.createdAt}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Delivery</p>
                          <p className="font-medium text-gray-900">
                            {webhook.lastDelivery || "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Success</p>
                          <p className="font-medium text-gray-900">
                            {webhook.lastSuccess || "Never"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Failures</p>
                          <p
                            className={`font-medium ${webhook.failureCount > 0 ? "text-red-600" : "text-gray-900"}`}
                          >
                            {webhook.failureCount}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => testWebhook(webhook)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Test Webhook"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button
                        onClick={() => viewDeliveryLogs(webhook.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="View Delivery Logs"
                      >
                        <Clock size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingWebhook(webhook);
                          setFormData({
                            url: webhook.url,
                            events: webhook.events,
                          });
                          setShowCreateModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(webhook.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title={
                          webhook.status === "active"
                            ? "Deactivate"
                            : "Activate"
                        }
                      >
                        {webhook.status === "active" ? (
                          <XCircle size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteWebhook(webhook.id, webhook.url)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Webhook Best Practices
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Your endpoint should respond with a 200 status code within 10
              seconds
            </li>
            <li>
              • Implement idempotency using the webhook ID in your processing
              logic
            </li>
            <li>
              • Verify webhook signatures to ensure requests are from Go Flexi
            </li>
            <li>• Set up monitoring for failed deliveries</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-sm text-blue-900">Webhook Signature Header:</p>
            <code className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block">
              X-GoFlexi-Signature: sha256=7d8f9e3a2b1c...
            </code>
            <button
              onClick={() =>
                copyToClipboard("X-GoFlexi-Signature: sha256=7d8f9e3a2b1c...")
              }
              className="ml-2 text-xs text-blue-600 hover:text-blue-700"
            >
              <Copy size={14} className="inline" /> Copy
            </button>
          </div>
        </motion.div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingWebhook ? "Edit Webhook" : "Add Webhook Endpoint"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://yourdomain.com/webhook"
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be a valid HTTPS URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events to Send
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {eventOptions.map((event) => (
                      <label key={event.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                events: [...formData.events, event.value],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                events: formData.events.filter(
                                  (e) => e !== event.value,
                                ),
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {event.label}
                        </span>
                        <code className="ml-2 text-xs text-gray-500">
                          {event.value}
                        </code>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingWebhook(null);
                    setFormData({ url: "", events: [] });
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button onClick={handleSaveWebhook} className="btn btn-primary">
                  {editingWebhook ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Logs Modal */}
        {showLogs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Webhook Delivery Logs</h2>
                <button
                  onClick={() => setShowLogs(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {deliveryLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {log.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <code className="text-sm font-mono">{log.event}</code>
                          <span className="ml-3 text-xs text-gray-500">
                            {log.timestamp}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Status Code:</span>
                            <span
                              className={`ml-2 font-medium ${log.status === "success" ? "text-green-600" : "text-red-600"}`}
                            >
                              {log.responseCode}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {log.duration}
                            </span>
                          </div>
                        </div>
                        {log.error && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                            {log.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Webhooks;
