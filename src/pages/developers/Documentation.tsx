import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  Server,
  Lock,
  Zap,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const Documentation: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("getting-started");

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    {
      id: "getting-started",
      label: "Getting Started",
      icon: <Zap size={18} />,
    },
    { id: "authentication", label: "Authentication", icon: <Lock size={18} /> },
    { id: "endpoints", label: "API Endpoints", icon: <Server size={18} /> },
    { id: "examples", label: "Code Examples", icon: <Code size={18} /> },
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

  const renderCodeBlock = (code: string, language: string, id: string) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden my-4">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copiedCode === id ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Go Flexi | API Documentation</title>
        <meta
          name="description"
          content="Go Flexi API documentation for developers"
        />
      </Helmet>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API Documentation
          </h1>
          <p className="text-gray-600 text-lg">
            Integrate Go Flexi's payment and financial services into your
            application
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {section.icon}
                    <span className="ml-2">{section.label}</span>
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants} className="flex-1 space-y-8">
            {/* Getting Started */}
            <section
              id="getting-started"
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Getting Started
                </h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">
                  Welcome to the Go Flexi API! Our REST API allows you to
                  integrate payment processing, virtual cards, and financial
                  services into your application.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  Base URL
                </h3>
                {renderCodeBlock(
                  "https://api.goflexi.com/v1",
                  "text",
                  "base-url",
                )}
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  Requirements
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>A verified Go Flexi account</li>
                  <li>API keys from your developer dashboard</li>
                  <li>HTTPS for all API requests</li>
                </ul>
              </div>
            </section>

            {/* Authentication */}
            <section
              id="authentication"
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Authentication
                </h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">
                  All API requests must be authenticated using your API key.
                  Include your API key in the request headers.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  Request Headers
                </h3>
                {renderCodeBlock(
                  `Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`,
                  "http",
                  "auth-headers",
                )}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Security Note:</strong> Never expose your API
                    keys in client-side code. Always keep them secure on your
                    server.
                  </p>
                </div>
              </div>
            </section>

            {/* API Endpoints */}
            <section
              id="endpoints"
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <Server className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  API Endpoints
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Transfer Funds
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">
                        POST
                      </span>
                      <code className="ml-3 text-sm">/transfers</code>
                    </div>
                    {renderCodeBlock(
                      `{
  "amount": 10000,
  "currency": "NGN",
  "recipient": "user@example.com",
  "reference": "txn_123456",
  "description": "Payment for services"
}`,
                      "json",
                      "transfer-example",
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Create Virtual Card
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">
                        POST
                      </span>
                      <code className="ml-3 text-sm">/cards/virtual</code>
                    </div>
                    {renderCodeBlock(
                      `{
  "type": "USD",
  "currency": "USD",
  "amount": 100,
  "cardholder_name": "John Doe"
}`,
                      "json",
                      "card-example",
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Get Balance
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                        GET
                      </span>
                      <code className="ml-3 text-sm">/balance</code>
                    </div>
                    {renderCodeBlock(
                      `{
  "NGN": 250000,
  "USD": 500
}`,
                      "json",
                      "balance-example",
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Code Examples */}
            <section
              id="examples"
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <Code className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Code Examples
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    JavaScript/Node.js
                  </h3>
                  {renderCodeBlock(
                    `const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.goflexi.com/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Transfer funds
async function transfer(amount, recipient) {
  try {
    const response = await api.post('/transfers', {
      amount,
      currency: 'NGN',
      recipient,
      reference: \`txn_\${Date.now()}\`
    });
    return response.data;
  } catch (error) {
    console.error('Transfer failed:', error.response.data);
  }
}`,
                    "javascript",
                    "js-example",
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Python
                  </h3>
                  {renderCodeBlock(
                    `import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.goflexi.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def transfer_funds(amount, recipient):
    payload = {
        "amount": amount,
        "currency": "NGN",
        "recipient": recipient,
        "reference": f"txn_{int(time.time())}"
    }
    
    response = requests.post(
        f"{BASE_URL}/transfers",
        json=payload,
        headers=headers
    )
    
    return response.json()`,
                    "python",
                    "python-example",
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    cURL
                  </h3>
                  {renderCodeBlock(
                    `curl -X POST https://api.goflexi.com/v1/transfers \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10000,
    "currency": "NGN",
    "recipient": "user@example.com",
    "reference": "txn_123456"
  }'`,
                    "bash",
                    "curl-example",
                  )}
                </div>
              </div>
            </section>

            <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Need help with integration?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Check our full API reference or contact support
                  </p>
                </div>
                <a
                  href="/developers/api-reference"
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  View Full API Reference
                  <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Documentation;
