'use client';
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

export default function HirersLayout({ children }) {
  return (
    <RoleProtectedRoute allowedRole="hirer">
      {children}
    </RoleProtectedRoute>
  );
}
