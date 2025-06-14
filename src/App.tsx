import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddFunds from "./pages/AddFunds";
// import Transfer from "./pages/Transfer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import VerifyAuthOTP from "./pages/VerifyAuthOTP";
import NewPassword from "./pages/NewPassword";

import { useBalancePolling } from "./hooks/useBalancePolling";
import { useAuthStore } from "./stores/authStore";

function App() {
  const { isAuthenticated, user } = useAuthStore();

  useBalancePolling(user?.id);

  return (
    <>
      <Toaster position="bottom-center" />

      <Routes>
        <Route
          path="/"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/auth/verify"
          element={
            !isAuthenticated ? <VerifyAuthOTP /> : <Navigate to="/dashboard" />
          }
        />

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

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-funds" element={<AddFunds />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/transfer" element={<Transfer />} />
            <Route path="/profile" element={<Profile />} /> */}
          </Route>
        </Route>

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
