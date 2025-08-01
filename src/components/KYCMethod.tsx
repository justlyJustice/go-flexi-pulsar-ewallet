import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, X, Smartphone, User, Calendar, Check } from "lucide-react";

interface KYCMethodProps {
  method: "bvn" | "nin";
  onCancel: () => void;
  onComplete: () => void;
}

const KYCMethod: React.FC<KYCMethodProps> = ({
  method,
  onCancel,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    number: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    verificationCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "bvn") {
      if (step === 1) {
        // Simulate sending verification code
        setStep(2);
      } else {
        // Simulate verification completion
        onComplete();
      }
    } else if (method === "nin") {
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {method === "bvn" ? "BVN Verification" : "NIN Verification"}
        </h3>

        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center mb-6">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 1
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {step === 1 ? "1" : <Check size={16} />}
        </div>
        <div
          className={`flex-1 h-1 mx-2 ${
            step >= 2 ? "bg-primary-600" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 2
              ? "bg-primary-600 text-white"
              : step > 2
              ? "bg-gray-200 text-gray-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {step <= 2 ? "2" : <Check size={16} />}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {method === "bvn" ? "BVN Number" : "NIN Number"}
              </label>

              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Shield size={16} className="text-gray-400" />
                </div>

                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder={
                    method === "bvn" ? "Enter your BVN" : "Enter your NIN"
                  }
                  required
                  maxLength={method === "bvn" ? 11 : 11}
                  pattern={method === "bvn" ? "\\d{11}" : "\\d{11}"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>

                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone size={16} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Phone number"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Verification Code Sent
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      We've sent a 6-digit verification code to{" "}
                      {formData.phoneNumber}. Please enter it below.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleInputChange}
                className="input"
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                pattern="\d{6}"
              />
            </div>

            <div className="text-sm text-gray-500">
              Didn't receive code?{" "}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Resend code
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-outline"
            >
              Back
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {step === 1 ? "Send Verification Code" : "Complete Verification"}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default KYCMethod;
