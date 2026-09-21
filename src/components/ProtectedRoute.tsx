import React from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore, UserTier } from "../stores/authStore";

type ProtectedRouteProps = {
  children: React.ReactNode;
  tier?: UserTier | UserTier[];
};

const ProtectedRoute = ({ children, tier }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (tier && !tier.includes(user?.tier!)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
