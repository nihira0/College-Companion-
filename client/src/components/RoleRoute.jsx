import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccessDenied } from '../pages/AccessDenied';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-poppins text-xs font-semibold">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          Authenticating...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role || 'student';
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(userRole)) {
    return <AccessDenied requiredRole={roles.join(' or ')} />;
  }

  return children;
};
