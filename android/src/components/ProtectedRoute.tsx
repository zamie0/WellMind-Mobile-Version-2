import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentSession } = useAuthStore();

  // Not authenticated - redirect to home (will show auth page)
  if (!currentSession.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch - redirect away
  if (requiredRole && currentSession.userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
