import React from 'react';
import { Navigate } from 'react-router-dom';

function RequireAuth({ children, allowedRoles }) {
  const userRole = localStorage.getItem('userRole');

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequireAuth;