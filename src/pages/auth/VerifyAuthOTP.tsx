import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, Lock, ArrowRight } from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import { verifyOTP } from "../../services/auth";
import useSubmit from "../../hooks/useSubmit";
import toast from "react-hot-toast";

const VerifyAuthOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuthStore();
  const { submit, isError, isSubmitting, message } = useSubmit(verifyOTP, {
    resetDelay: 10000,
  });
  const email = location.state?.email;

  if (!email) {
    navigate("/");
    return null;
  }

  const [values, setValues] = useState({
    emailOTP: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { emailOTP } = values;

    if (!emailOTP) {
      return;
    }

    const res = await submit({ email, emailOTP });
    if (!res) return;

    if (res.ok) {
      const data = res.data?.data;
      const user = data?.user;

      login(
        {
          beneficiaries: user.beneficiaries,
          balance: user.accountBalance,
          bankInformation: {
            accountName: user.accountName,
            accountNumber: user.accountNumber,
            bankName: user.bankName,
          },
          currency: user.currency,
          email: user.email,
          fullName: user.fullName,
          id: user._id,
          joinDate: user.createdAt,
          phoneNumber: user.phoneNumber,
          transactions: user.transactions,
          bvnVerified: user.bvnVerified,
          isKYC: user.isKYC,
          ninVerified: user.ninVerified,
          cacVerified: user.cacVerified,
          vusd_card: user.vusd_card,
          tier: user.tier,
          dailyTransferAmount: user.dailyTransferAmount,
          dailyTransferLimit: user.dailyTransferLimit,
          monthlyTransferAmount: user.monthlyTransferAmount,
          monthlyTransferLimit: user.monthlyTransferLimit,
          lastDailyReset: user.lastDailyReset,
          lastMonthlyReset: user.lastMonthlyReset,
          lastTransferTime: user.lastTransferTime,
        },
        data?.token!
      );

      toast.success("Login Successful!");
      setTimeout(() => {
        navigate("/dashboard");
        location.state = {};
      }, 1000);
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
          Welcome to Rulsar
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          A verification code has been sent to{" "}
          <span className="font-bold">{email}. </span>Enter the code to continue
          to dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
          <form className="space-y-3" onSubmit={handleSubmit}>
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
                Verification Code (OTP)
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Lock className="h-3 w-2 text-gray-400" />
                </div>

                <input
                  id="emailOTP"
                  name="emailOTP"
                  type="emailOTP"
                  autoComplete="emailOTP"
                  required
                  value={values.emailOTP}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter OTP code"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary flex justify-center items-center text-base py-2.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in
                    <ArrowRight className="ml-1 h-3 w-2" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyAuthOTP;
