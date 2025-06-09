import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSubmit from "../hooks/useSubmit";
import { verifyResetCode } from "../services/auth";
import toast from "react-hot-toast";

const VerifyCode: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submit, isError, isSubmitting, message } = useSubmit(verifyResetCode);
  const [code, setCode] = useState("");
  const email = location.state?.email;

  if (!email) {
    navigate("/recovery/forgot-password");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submit({ email, emailOTP: code });
    if (res?.ok) {
      toast.success(res.data?.data.message);
      navigate("/recovery/set-new-password", { state: { email } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Verify Your Code
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the verification code sent to {email}
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
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                Verification Code
              </label>

              <input
                id="code"
                name="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input mt-1"
                placeholder="Enter 6-digit code"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary flex justify-center items-center text-base py-2.5"
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => navigate("/recovery/forgot-password")}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
