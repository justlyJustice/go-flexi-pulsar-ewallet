import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Wallet } from "lucide-react";
import toast from "react-hot-toast";

import useSubmit from "../../hooks/useSubmit";
import { requestPasswordRequest } from "../../services/auth";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { submit, isError, isSubmitting, message } = useSubmit(
    requestPasswordRequest,
    { resetDelay: 5000 }
  );
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submit(email);
    if (!res) return;

    if (res.ok) {
      toast.success(res.data?.data);
      navigate("/recovery/verify-email", { state: { email } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-primary-600 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {message}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Mail className="h-3 w-2 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary flex justify-center items-center text-base py-2.5"
              >
                {isSubmitting ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <Link
              to="/"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
