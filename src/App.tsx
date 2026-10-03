import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import BillPayment from "./pages/BillPayment";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import AddFunds from "./pages/AddFunds";
import Transfer from "./pages/Transfer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyCode from "./pages/auth/VerifyCode";
// import VerifyAuthOTP from "./pages/auth/VerifyAuthOTP";
import NewPassword from "./pages/auth/NewPassword";

import { useBalancePolling } from "./hooks/useBalancePolling";
import { useAuthStore } from "./stores/authStore";
// import CurrencyExchange from "./pages/services/CurrencyExchange";
// import BulkSMS from "./pages/services/BulkSMS";
// import USDTFunding from "./pages/services/USDTFunding";
import VirtualCard from "./pages/services/VirtualCard";
import useTransactions from "./hooks/useTransactions";
import ConvertUSD from "./pages/ConvertUSD";
import FundNaira from "./pages/FundNaira";
import MerchantVerification from "./pages/MerchantVerification";
import MerchantClaim from "./pages/MerchantClaim";
import PDFList from "./pages/PDFList";

function App() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.clear();
    };

    window.addEventListener(
      "beforeunload",
      import.meta.env.MODE === "development" ? () => {} : handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        import.meta.env.MODE === "development" ? () => {} : handleBeforeUnload,
      );
    };
  }, []);

  useTransactions();
  useBalancePolling(user?.id);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ removeDelay: 6000 }} />

      <Routes>
        <Route
          path="/"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* <Route
          path="/auth/verify"
          element={
            !isAuthenticated ? <VerifyAuthOTP /> : <Navigate to="/dashboard" />
          }
        /> */}

        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          }
        />

        <Route
          path="/recovery/forgot-password"
          element={
            !isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />
          }
        />

        <Route
          path="/recovery/verify-email"
          element={
            !isAuthenticated ? <VerifyCode /> : <Navigate to="/dashboard" />
          }
        />

        <Route
          path="/recovery/set-new-password"
          element={
            !isAuthenticated ? <NewPassword /> : <Navigate to="/dashboard" />
          }
        />

        {/* <Route element={<ProtectedRoute />}> */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-funds/naira"
            element={
              <ProtectedRoute>
                <FundNaira />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-funds/usd"
            element={
              <ProtectedRoute>
                <ConvertUSD />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/merchant/verification"
            element={
              <ProtectedRoute tier="merchant">
                <MerchantVerification />
              </ProtectedRoute>
            }
          />

          <Route
            path="/merchant/claim"
            element={
              <ProtectedRoute tier="merchant">
                <MerchantClaim />
              </ProtectedRoute>
            }
          />

          <Route
            path="/beneficiaries/"
            element={
              <ProtectedRoute tier="merchant">
                <PDFList />
              </ProtectedRoute>
            }
          />

          {/* Bill Payments */}

          <Route
            path="/bill-payment/airtime"
            element={
              <ProtectedRoute>
                <BillPayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bill-payment/data"
            element={
              <ProtectedRoute>
                <BillPayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/services/virtual-usd-card"
            element={
              <ProtectedRoute tier={["business", "merchant"]}>
                <VirtualCard
                  cardType="usd"
                  // walletBalance={500}
                />
              </ProtectedRoute>
            }
          />

          {/* <Route
              path="/bill-payment/recharge-card"
              element={<BillPayment />}
            /> */}
          {/* <Route path="/bill-payment/cable-tv" element={<BillPayment />} />
            <Route path="/bill-payment/electricity" element={<BillPayment />} /> */}
          {/* <Route
              path="/bill-payment/education-pin"
              element={<BillPayment />}
            /> */}

          {/* Financial Services */}
          {/* <Route
              path="/services/virtual-naira-card"
              element={
                <VirtualCard
                  cardType="naira"
                  // walletBalance={10000}
                />
              }
            />

             */}
          {/* <Route
              path="/services/currency-exchange"
              element={<CurrencyExchange />}
            /> */}
          {/* <Route path="/services/usdt-funding" element={<USDTFunding />} />
            <Route path="/services/bulk-sms" element={<BulkSMS />} /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
          <Route
            path="/transfer"
            element={
              <ProtectedRoute tier={["business", "merchant"]}>
                <Transfer />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* </Route> */}

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
