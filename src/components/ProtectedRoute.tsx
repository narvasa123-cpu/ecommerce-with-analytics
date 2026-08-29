import { Navigate } from 'react-router-dom';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  userRole?: UserRole | null;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  userRole,
}: ProtectedRouteProps) {
  // If no user role, redirect to login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not in allowed roles, redirect to appropriate dashboard
  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
    if (userRole === 'STAFF') return <Navigate to="/staff" replace />;
    if (userRole === 'RIDER') return <Navigate to="/rider" replace />;
    if (userRole === 'CUSTOMER') return <Navigate to="/customer" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
