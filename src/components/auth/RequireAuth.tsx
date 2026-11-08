import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/context/ClientAuthContext";

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth context is checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-gray-500">Checking authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Auth context already handles all session checks, so we just trust its state
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render protected content
  
  return <>{children}</>;
};

export default RequireAuth;
