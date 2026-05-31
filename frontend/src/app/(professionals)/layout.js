'use client';
import RoleProtectedRoute from '@/components/layout/RoleProtectedRoute';

export default function ProfessionalsLayout({ children }) {
  return (
    <RoleProtectedRoute allowedRole="professional">
      {children}
    </RoleProtectedRoute>
  );
}
